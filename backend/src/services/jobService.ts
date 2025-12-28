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
    /**
     * Pauses a specific job queue.
     */
    async pauseQueue(type: JobType) {
        const queue = getQueue(type);
        await queue.pause();
    }

    /**
     * Resumes a specific job queue.
     */
    async resumeQueue(type: JobType) {
        const queue = getQueue(type);
        await queue.resume();
    }

    /**
     * Completely purges a queue of all jobs (waiting, active, completed, failed, delayed).
     * Used for hard restarting a job type.
     */
    async purgeQueue(type: JobType) {
        const queue = getQueue(type);
        await queue.pause();
        // Remove all kinds of jobs
        await queue.obliterate({ force: true });
        await queue.resume();

        // Also optionally clear JobRun table for this type if we want true reset
        // await prisma.jobRun.deleteMany({ where: { type } });
    }

    /**
     * "Restarts" a job type by finding all eligible items and queuing them.
     * This effectively does a bulk re-process.
     */
    async restartJob(type: JobType) {
        console.log(`Restarting (Purging & Re-queuing) jobs for ${type}...`);

        // 1. Purge existing queue to reset counts
        await this.purgeQueue(type);

        switch (type) {
            case 'scan':
                // For scan, just trigger a new scan job
                // Find all sources and trigger a scan for each? 
                // Or just one main scan? Main scan works.
                // But better: trigger scan for all enabled sources
                const sources = await prisma.source.findMany({ where: { enabled: true } });
                for (const source of sources) {
                    await this.addJob('scan', 'Scan Source', { sourceId: source.id, sourcePath: source.path });
                }
                break;

            case 'thumbs':
            case 'metadata':
                // For thumbs/metadata, we want to process ALL media
                // We should chunk this to avoid OOM on huge DBs, but for now findMany id is okay
                const allMedia = await prisma.media.findMany({
                    select: { id: true, fileId: true, type: true },
                    where: type === 'metadata' ? {} : { type: { in: ['image', 'video'] } }
                });

                // Optimization: Fetch IDs and Files
                const mediaWithFiles = await prisma.media.findMany({
                    select: {
                        id: true,
                        fileId: true,
                        type: true,
                        file: { select: { path: true } }
                    },
                    where: {
                        type: { in: ['image', 'video'] }
                        // For metadata we might want all types, but let's stick to image/video for now in bulk restart
                    }
                });

                console.log(`Queueing ${mediaWithFiles.length} jobs for ${type}`);

                for (const m of mediaWithFiles) {
                    await this.addJob(type, `${type} for ${m.id}`, {
                        mediaId: m.id,
                        fileId: m.fileId,
                        filePath: m.file?.path
                    });
                }
                break;

            case 'preview':
                const videos = await prisma.media.findMany({
                    select: {
                        id: true,
                        fileId: true,
                        file: { select: { path: true } }
                    },
                    where: { type: 'video' }
                });

                for (const v of videos) {
                    await this.addJob('preview', `Preview for ${v.id}`, {
                        mediaId: v.id,
                        fileId: v.fileId,
                        filePath: v.file.path
                    });
                }
                break;

            default:
                console.warn(`Restart logic not implemented for ${type}`);
        }
    }
}

export const jobService = new JobService();
