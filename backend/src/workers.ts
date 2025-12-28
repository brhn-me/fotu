import { Worker } from 'bullmq';
import { JOBS_CONFIG, JobType } from './config/jobsConfig';
import { getJobProcessor } from './jobs/jobRegistry';
import { settingsService } from './services/settingsService';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

const connection = {
    host: REDIS_HOST,
    port: REDIS_PORT
};

// Map of job type to Worker instance
const workers: Map<JobType, Worker> = new Map();

// Track current concurrency to avoid unnecessary restarts
const currentConcurrency: Map<JobType, number> = new Map();

export async function initWorkers() {
    // 1. Get initial settings
    const settings = await settingsService.getTyped();

    // 2. Initialize all workers
    await syncWorkers(settings.jobs);

    // 3. Listen for updates
    settingsService.on('settingsUpdated', async () => {
        console.log('Settings updated, checking worker concurrency...');
        const newSettings = await settingsService.getTyped();
        await syncWorkers(newSettings.jobs);
    });
}

async function syncWorkers(jobsConfig: Record<string, number>) {
    const promises = Object.keys(JOBS_CONFIG).map(async (key) => {
        const type = key as JobType;
        // Default concurrency from JOBS_CONFIG
        let targetConcurrency = jobsConfig[type] || JOBS_CONFIG[type]?.defaultConcurrency || 1;

        // Scan job should ideally stay sequential to avoid IO trashing and locking issues,
        // but let's allow override if user really wants it. 
        // Force valid number
        if (targetConcurrency < 1) targetConcurrency = 1;

        // Check if restart needed
        const activeWorker = workers.get(type);
        const current = currentConcurrency.get(type) || 0;

        if (activeWorker) {
            if (current === targetConcurrency) {
                // No change needed
                return;
            }
            console.log(`Restarting worker for ${type} (Concurrency: ${current} -> ${targetConcurrency})`);
            await activeWorker.close();
            workers.delete(type);
        } else {
            console.log(`Initializing worker for ${type} (Concurrency: ${targetConcurrency})`);
        }

        startWorker(type, targetConcurrency);
    });

    await Promise.all(promises);
}

import { getLogger } from './lib/logger';
import { emitJobUpdate, emitEvent } from './lib/socket';

function startWorker(type: JobType, concurrency: number) {
    const processor = getJobProcessor(type);
    if (!processor) {
        console.warn(`No processor found for job type: ${type}`);
        return;
    }

    const logger = getLogger(type);

    const worker = new Worker(type, async (job) => {
        // Emit progress start (approx)
        emitJobUpdate(job.id!, 'active', { progress: 0 });

        try {
            // Enhanced logging with payload details
            logger.info(`Starting job ${job.id}`, { data: job.data });

            const result = await processor.process(job);

            logger.info(`Completed job ${job.id}`, { result });

            // Respect Job Delay setting (Per Job)
            const settings = await settingsService.getTyped();
            let delay = 100; // Default global fallback

            // Use specific delay if valid number, otherwise default from config, then hard fallback to 100
            if (settings.jobDelays && typeof settings.jobDelays[type] === 'number') {
                delay = settings.jobDelays[type];
            } else if (JOBS_CONFIG[type]?.defaultDelay !== undefined) {
                delay = JOBS_CONFIG[type].defaultDelay!;
            }

            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            return result;
        } catch (error: any) {
            // Enhanced error logging
            logger.error(`Job ${job.id} failed`, {
                error: error.message,
                stack: error.stack,
                data: job.data
            });
            throw error;
        }
    }, {
        connection,
        concurrency
    });

    worker.on('active', (job) => {
        emitJobUpdate(job.id!, 'active');
        // Also emit a general 'jobs-updated' event to refresh lists if needed
        emitEvent('jobs-updated', { type, action: 'active', jobId: job.id });
    });

    worker.on('completed', (job) => {
        emitJobUpdate(job.id!, 'completed');
        emitEvent('jobs-updated', { type, action: 'completed', jobId: job.id });
    });

    worker.on('failed', (job, err) => {
        emitJobUpdate(job?.id || 'unknown', 'failed', { error: err.message });
        emitEvent('jobs-updated', { type, action: 'failed', jobId: job?.id });
    });

    workers.set(type, worker);
    currentConcurrency.set(type, concurrency);
}

export async function closeWorkers() {
    console.log('Shutting down workers...');
    await Promise.all(Array.from(workers.values()).map(w => w.close()));
    workers.clear();
    currentConcurrency.clear();
    console.log('All workers closed');
}
