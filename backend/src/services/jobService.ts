import prisma from '../db/client';
import { getQueue } from '../lib/queue';
import { JobType } from '../config/jobsConfig';

class JobService {
    /**
     * Adds a job to the database and the BullMQ queue.
     * The JobRun ID will be used as the BullMQ Job ID.
     */
    async addJob(type: JobType, name: string, data: any) {
        // 1. Create JobRun record
        const jobRun = await prisma.jobRun.create({
            data: {
                name,
                type,
                status: 'queued',
                data,
                progress: 0
            }
        });

        // 2. Add to Queue
        const queue = getQueue(type);
        await queue.add(name, data, {
            jobId: jobRun.id, // Link DB ID to BullMQ ID
            removeOnComplete: 1000000, // Keep more history so stats look correct
            removeOnFail: 5000
        });

        return jobRun;
    }

    /**
     * Updates the status of a job run.
     */
    async updateStatus(id: string, status: string, result?: any) {
        try {
            await prisma.jobRun.update({
                where: { id },
                data: {
                    status,
                    result: result ?? undefined,
                    startedAt: status === 'running' ? new Date() : undefined,
                    completedAt: ['completed', 'failed'].includes(status) ? new Date() : undefined
                }
            });
        } catch (error) {
            console.error(`Failed to update job status for ${id}:`, error);
        }
    }
}

export const jobService = new JobService();
