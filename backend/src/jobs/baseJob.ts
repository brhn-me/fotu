import { Job } from 'bullmq';
import prisma from '../db/client';

export interface JobProgress {
    total: number;
    completed: number;
    failed: number;
    status: 'running' | 'completed' | 'failed' | 'paused';
}

export abstract class BaseJob {
    abstract process(job: Job): Promise<any>;

    async reportProgress(job: Job, progress: JobProgress) {
        // Update BullMQ progress
        const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
        await job.updateProgress(percentage);

        // Optional: Update a JobRun record in DB if we were tracking specific run IDs deeply
    }

    async handleError(job: Job, error: any) {
        console.error(`Job ${job.name} failed:`, error);
        // Could update DB status here
    }
}
