import { Queue } from 'bullmq';
import { JOBS_CONFIG, JobType } from '../config/jobsConfig';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

const connection = {
    host: REDIS_HOST,
    port: REDIS_PORT
};

const queues: Partial<Record<JobType, Queue>> = {};

export function getQueue(name: JobType): Queue {
    if (!queues[name]) {
        queues[name] = new Queue(name, {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                },
                removeOnComplete: 100, // Keep last 100
                removeOnFail: 500      // Keep last 500 for debugging
            }
        });
    }
    return queues[name]!;
}

export function initQueues() {
    Object.keys(JOBS_CONFIG).forEach(key => {
        getQueue(key as JobType);
    });
}

export async function closeQueues() {
    console.log('Shutting down queues...');
    await Promise.all(Object.values(queues).map(q => q?.close()));
    console.log('All queues closed');
}
