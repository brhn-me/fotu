import { Job } from 'bullmq';
import { BaseJob, JobProgress } from '../baseJob';
import { getQueue } from '../../lib/queue';
import { JOBS_CONFIG } from '../../config/jobsConfig';
import prisma from '../../db/client';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { createReadStream } from 'fs';

import { jobService } from '../../services/jobService';

export class ScanJob extends BaseJob {

    async process(job: Job) {
        // SISULATION DELAY: 3 seconds
        await new Promise(resolve => setTimeout(resolve, 25));

        const { sourceId, path: scanPath, parentId } = job.data;

        if (!sourceId && !scanPath && !job.data.sourcePath) {
            throw new Error('Missing sourceId or path');
        }

        // Handle both granular path and initial sourcePath
        const effectivePath = scanPath || job.data.sourcePath;

        if (!sourceId) throw new Error('Missing sourceId');


        // If this is the root job (no parentId), mark source as scanning
        if (!parentId) {
            await prisma.source.update({
                where: { id: sourceId },
                data: { status: 'SCANNING', scannedAt: new Date() }
            });
        }

        const stats = await fs.stat(effectivePath);

        if (stats.isDirectory()) {
            await this.processDirectory(effectivePath, sourceId, parentId);
        } else if (stats.isFile()) {
            await this.processFile(effectivePath, sourceId, parentId);
        }
    }

    private async processDirectory(dirPath: string, sourceId: string, parentId: string | null) {
        const name = path.basename(dirPath);

        // 1. Persist Directory
        const directory = await prisma.file.upsert({
            where: { path: dirPath },
            update: {
                updatedAt: new Date(),
                isDirectory: true,
                parentId
            },
            create: {
                path: dirPath,
                name,
                extension: null,
                size: BigInt(0),
                // mimeType removed from File
                sourceId,
                isDirectory: true,
                parentId
            }
        });

        // 2. Read contents and spawn jobs
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            await jobService.addJob('scan', `scan-${path.basename(fullPath)}`, {
                sourceId,
                path: fullPath,
                parentId: directory.id
            });
        }
    }

    private async processFile(filePath: string, sourceId: string, parentId: string | null) {
        const stats = await fs.stat(filePath);
        const name = path.basename(filePath);
        const ext = path.extname(filePath).toLowerCase();

        // determine mime type
        const mimeType = this.getMimeType(ext);

        // 1. Calculate Hash
        const hash = await this.calculateHash(filePath);

        const file = await prisma.file.upsert({
            where: { path: filePath },
            update: {
                size: stats.size,
                // mimeType removed from File
                updatedAt: new Date(),
                isDirectory: false,
                parentId,
                hash
            },
            create: {
                path: filePath,
                name,
                extension: ext,
                size: stats.size,
                // mimeType removed from File
                sourceId,
                isDirectory: false,
                parentId,
                hash
            }
        });

        const isMedia = mimeType && (mimeType.startsWith('image/') || mimeType.startsWith('video/'));

        if (isMedia) {
            const media = await prisma.media.upsert({
                where: { fileId: file.id },
                update: {},
                create: {
                    fileId: file.id,
                    sourceId,
                    type: mimeType.split('/')[0],
                    mimeType: mimeType
                }
            });

            // CHAINING JOBS

            // 1. Metadata Extraction
            await jobService.addJob('metadata', `metadata-${file.id}`, {
                mediaId: media.id,
                fileId: file.id,
                filePath
            });

            // 2. Thumbnail Generation
            await jobService.addJob('thumbs', `thumbs-${file.id}`, {
                mediaId: media.id,
                fileId: file.id,
                filePath
            });

            // 3. Preview Generation (Videos only)
            if (mimeType.startsWith('video/')) {
                await jobService.addJob('preview', `preview-${file.id}`, {
                    mediaId: media.id,
                    fileId: file.id,
                    filePath
                });
            }
        }
    }

    private async calculateHash(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = createReadStream(filePath);

            stream.on('error', (err: any) => reject(err));
            stream.on('data', (chunk: any) => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }

    private getMimeType(ext: string): string | null {
        const map: Record<string, string> = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.png': 'image/png', '.gif': 'image/gif',
            '.mp4': 'video/mp4', '.mov': 'video/quicktime'
        };
        return map[ext] || null;
    }
}
