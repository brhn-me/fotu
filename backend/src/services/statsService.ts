import prisma from '../db/client';
import { exec } from 'child_process';
import util from 'util';
import { config } from '../config';

const execAsync = util.promisify(exec);

export interface SystemStats {
    photos: number;
    videos: number;
    totalFiles: number;
    usageBytes: bigint;
    usageGB: number;
    // Disk Info
    freeBytes: string;
    totalBytes: string;
    freeGB: number;
    totalGB: number;
}

class StatsService {
    /**
     * Aggregates stats from the database and checks disk usage.
     */
    async getStats(): Promise<SystemStats> {
        // media counts
        const photos = await prisma.media.count({ where: { type: 'image' } });
        const videos = await prisma.media.count({ where: { type: 'video' } });

        // total files
        const totalFiles = await prisma.file.count();

        // total storage (sum of size)
        const storageAgg = await prisma.file.aggregate({
            _sum: {
                size: true
            }
        });

        const usageBytes = storageAgg._sum.size || BigInt(0);
        const usageGB = Number(usageBytes) / (1024 * 1024 * 1024);

        // Check Disk Space using df
        let freeBytes = BigInt(0);
        let totalBytes = BigInt(0);

        try {
            // -B1 results in bytes
            // --output=size,avail (standard)
            const cmd = `df -B1 --output=size,avail "${config.rootDataDir}" | tail -n 1`;
            const { stdout } = await execAsync(cmd);

            // Output format: "  123456   7890" (whitespace separated)
            const parts = stdout.trim().split(/\s+/);

            if (parts.length >= 2) {
                totalBytes = BigInt(parts[0]);
                freeBytes = BigInt(parts[1]);
            }
        } catch (err) {
            console.error("Failed to check disk space:", err);
            // Fallbacks if df fails
            totalBytes = BigInt(0);
            freeBytes = BigInt(0);
        }

        return {
            photos,
            videos,
            totalFiles,
            usageBytes,
            usageGB,
            freeBytes: freeBytes.toString(),
            totalBytes: totalBytes.toString(),
            freeGB: Number(freeBytes) / (1024 * 1024 * 1024),
            totalGB: Number(totalBytes) / (1024 * 1024 * 1024),
        };
    }
}

export const statsService = new StatsService();
