import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { Redis } from 'ioredis'
import prisma from '../db/client'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null })

export type JobHandler<T = any> = (job: Job<T>) => Promise<void>

export class JobManager {
    private queue: Queue
    private worker: Worker
    private queueEvents: QueueEvents
    private name: string

    constructor(name: string, handler: JobHandler) {
        this.name = name
        this.queue = new Queue(name, { connection })
        this.queueEvents = new QueueEvents(name, { connection })

        this.worker = new Worker(name, async (job) => {
            // Update job Run status in DB
            await this.updateJobRunStatus(job.id!, 'running')
            try {
                await handler(job)
                await this.updateJobRunStatus(job.id!, 'completed')
            } catch (error: any) {
                await this.updateJobRunStatus(job.id!, 'failed', { error: error.message })
                throw error
            }
        }, { connection })

        this.setupListeners()
    }

    private setupListeners() {
        this.worker.on('completed', (job) => {
            console.log(`Job ${job.id} completed!`)
        })

        this.worker.on('failed', (job, err) => {
            console.log(`Job ${job?.id} failed with ${err.message}`)
        })
    }

    private async updateJobRunStatus(jobId: string, status: string, result?: any) {
        // We assume the Job ID matches or is linked to the DB ID if we pass it, 
        // or we might need to look it up. For now, we'll try to update if UUID.
        try {
            // Simple validation if uuid
            if (!jobId.includes('-')) return

            await prisma.jobRun.updateMany({
                where: { id: jobId },
                data: {
                    status,
                    result: result ? result : undefined,
                    completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined,
                    startedAt: status === 'running' ? new Date() : undefined
                }
            })
        } catch (e) {
            console.warn(`Failed to update job run status for job ${jobId}`, e)
        }
    }

    async addJob(name: string, data: any, opts?: any) {
        // Create DB entry first
        const jobRun = await prisma.jobRun.create({
            data: {
                name: this.name,
                type: name,
                status: 'queued',
                data: data
            }
        })

        // Add to BullMQ with the DB ID as the job ID
        await this.queue.add(name, data, { ...opts, jobId: jobRun.id })
        return jobRun
    }

    async getJob(jobId: string) {
        return this.queue.getJob(jobId)
    }

    async pause() {
        await this.queue.pause()
    }

    async resume() {
        await this.queue.resume()
    }
}
