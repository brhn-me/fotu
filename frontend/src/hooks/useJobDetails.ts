// src/hooks/useJobDetails.ts
import { useMemo } from 'react';
import { Job } from '../pages/jobs/JobsPage';

type LogLevel = "info" | "warn" | "error";
export type JobLog = { id: string; ts: string; level: LogLevel; message: string };

export type JobItem = {
    id: string;
    label: string;
    ref?: string;
    updatedAt: string;
};

// ... utility functions
function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function makeItems(prefix: string, count: number): JobItem[] {
    const items: JobItem[] = [];
    const base = Date.now();
    for (let i = 0; i < count; i++) {
        const t = new Date(base - i * 45_000).toISOString();
        items.push({
            id: `${prefix}-${i + 1}`,
            label: `${prefix.toLowerCase()}_${i + 1}.jpg`,
            ref: `file://${prefix.toLowerCase()}/${i + 1}`,
            updatedAt: t,
        });
    }
    return items;
}

function makeLogs(jobTitle: string): JobLog[] {
    const ts = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000).toISOString();
    const logs: JobLog[] = [
        { id: "l1", ts: ts(38), level: "info", message: `${jobTitle}: worker started.` },
        { id: "l2", ts: ts(31), level: "info", message: `${jobTitle}: claimed 50 items from queue.` },
        { id: "l3", ts: ts(24), level: "warn", message: `${jobTitle}: slow item detected; retry scheduled.` },
        { id: "l4", ts: ts(14), level: "info", message: `${jobTitle}: processing item queue_12.jpg.` },
        { id: "l5", ts: ts(7), level: "error", message: `${jobTitle}: failed queue_7.jpg after max retries.` },
        { id: "l6", ts: ts(2), level: "info", message: `${jobTitle}: progress updated.` },
    ];
    return logs.sort((a, b) => (a.ts < b.ts ? 1 : -1));
}

export function useJobDetails(job: Job | undefined) {
    const model = useMemo(() => {
        if (!job) return null;

        const doneCount = clamp(job.completed, 0, job.total);
        const failedCount = clamp(job.failed, 0, job.total);
        const errorCount = clamp(job.errors, 0, job.total);

        const remaining = clamp(job.total - doneCount - failedCount, 0, job.total);
        const processingCount = job.status === "running" ? clamp(Math.min(5, remaining), 0, 5) : 0;
        const queuedCount = clamp(remaining - processingCount, 0, job.total);

        // In a real app, these items/logs would come from an API based on `job.id`
        const processing = makeItems("Processing", Math.min(60, processingCount));
        const queued = makeItems("Queue", Math.min(120, queuedCount));
        const done = makeItems("Done", Math.min(120, doneCount));
        const failed = makeItems("Failed", Math.min(120, failedCount));
        const errors = makeItems("Error", Math.min(120, errorCount));
        const logs = makeLogs(job.title);

        return {
            queuedCount,
            processingCount,
            doneCount,
            failedCount,
            errorCount,
            queued,
            processing,
            done,
            failed,
            errors,
            logs,
        };
    }, [job]);

    return model;
}

export const getStatusColor = (status: Job['status']) => {
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'failed': return 'bg-red-100 text-red-800';
        case 'paused': return 'bg-yellow-100 text-yellow-800';
        case 'running': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
