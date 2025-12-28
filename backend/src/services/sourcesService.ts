import prisma from '../db/client';
import { jobService } from './jobService'; // Use jobService instead of direct queue
import { promises as fs } from 'fs';
import * as path from 'path';

export interface CreateSourceDto {
    path: string;
    mode: 'scanOnce' | 'watch';
}

class SourcesService {
    /**
     * Retrieves all sources ordered by creation date.
     */
    async getAll() {
        return prisma.source.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Adds a new source directory.
     * Validates that the path doesn't already exist and is accessible.
     */
    async add(data: CreateSourceDto) {
        try {
            await fs.access(data.path);
        } catch {
            throw new Error('Path does not exist');
        }

        try {
            const source = await prisma.source.create({
                data: {
                    path: data.path,
                    mode: data.mode,
                    enabled: data.mode === 'watch',
                    status: 'SCANNING', // Start as scanning
                    scannedAt: new Date()
                }
            });

            // Trigger scan job via JobService for proper tracking
            await jobService.addJob('scan', `scan-root-${source.id}`, {
                sourceId: source.id,
                path: source.path
            });

            return source;
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new Error('Source path already exists');
            }
            throw error;
        }
    }

    /**
     * Removes a source by ID.
     */
    async remove(id: string) {
        return prisma.source.delete({
            where: { id }
        });
    }

    /**
     * Updates the last scanned timestamp and sets status to SCANNING.
     * In a real app, this would trigger the scan job which would eventually set it back to IDLE.
     */
    async scan(id: string) {
        const source = await prisma.source.findUnique({ where: { id } });
        if (!source) throw new Error('Source not found');

        // Trigger scan job via JobService
        await jobService.addJob('scan', `scan-root-${source.id}`, {
            sourceId: source.id,
            path: source.path
        });

        // Optimistically update status
        return prisma.source.update({
            where: { id },
            data: { status: 'SCANNING' }
        });
    }

    /**
     * Toggles the enabled state of a source (only for watch mode).
     */
    async toggleWatch(id: string) {
        const source = await prisma.source.findUnique({ where: { id } });
        if (!source || source.mode !== 'watch') return source;

        return prisma.source.update({
            where: { id },
            data: { enabled: !source.enabled }
        });
    }
}

export const sourcesService = new SourcesService();
