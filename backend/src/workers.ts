import { Worker } from 'bullmq';
import { JOBS_CONFIG, JobType } from './config/jobsConfig';
import { getJobProcessor } from './jobs/jobRegistry';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

const connection = {
    host: REDIS_HOST,
    port: REDIS_PORT
};

const workers: Worker[] = [];

export function initWorkers() {
    Object.keys(JOBS_CONFIG).forEach((key) => {
        const type = key as JobType;
        const processor = getJobProcessor(type);

        if (processor) {
            console.log(`Initializing worker for ${type}`);
            const worker = new Worker(type, async (job) => {
                try {
                    return await processor.process(job);
                } catch (error) {
                    console.error(`Worker for ${type} failed:`, error);
                    // BaseJob's handleError could be called here if we passed the instance
                    throw error;
                }
            }, {
                connection,
                concurrency: type === 'scan' ? 1 : 4 // Serialize scans, parallelize hashes
            });

            worker.on('failed', (job, err) => {
                console.error(`${job?.name} failed with ${err.message}`);
            });

            workers.push(worker);
        } else {
            console.warn(`No processor found for job type: ${type}`);
        }
    });

    console.log(`Initialized ${workers.length} workers`);
}

export async function closeWorkers() {
    console.log('Shutting down workers...');
    await Promise.all(workers.map(w => w.close()));
    console.log('All workers closed');
}
