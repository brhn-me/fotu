import { Job } from 'bullmq';
import { BaseJob } from '../baseJob';
import prisma from '../../db/client';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { getTriePath } from '../../utils/pathUtils';
import { settingsService } from '../../services/settingsService';

const DATA_ROOT = process.env.FOTU_DATA_DIR || path.join(process.cwd(), '.cache');

export class ThumbsJob extends BaseJob {
    async process(job: Job) {
        // SISULATION DELAY: 3 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { mediaId, filePath } = job.data;

        if (!mediaId || !filePath) throw new Error('Missing mediaId or filePath');

        const media = await prisma.media.findUnique({ where: { id: mediaId } });
        if (!media) throw new Error('Media not found');

        // Fetch settings or use defaults
        const settings = await settingsService.getAll();
        const sizesStr = settings['thumbnailSizes'];
        let sizes = [
            { name: 'small', width: 200 }, // Fallback default
            { name: 'medium', width: 800 }
        ];

        if (sizesStr) {
            try {
                sizes = JSON.parse(sizesStr);
            } catch (e) {
                console.warn('Failed to parse thumbnailSizes setting, using defaults');
            }
        }

        const triePath = getTriePath(mediaId);
        // Desired output: DATA_ROOT/thumbs/<sizeName>/<triePath>.webp
        // e.g. .cache/thumbs/medium/ab/cd/abcd123.webp

        for (const size of sizes) {
            const outDir = path.join(DATA_ROOT, 'thumbs', size.name, path.dirname(triePath));
            const fileName = path.basename(triePath) + '.webp';
            const outPath = path.join(outDir, fileName);

            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            if (media.type === 'image') {
                await sharp(filePath)
                    .resize(size.width)
                    .webp({ quality: 80 })
                    .toFile(outPath);
            } else if (media.type === 'video') {
                await new Promise((resolve, reject) => {
                    // ffmpeg cannot output directly to webp easily in one go with sizing without complex filters, 
                    // easiest is to extract a frame then use sharp, OR use ffmpeg filter.
                    // For simplicity and quality, let's extract a png frame then convert with sharp.
                    // But strictly using fluent-ffmpeg:
                    ffmpeg(filePath)
                        .screenshots({
                            count: 1,
                            folder: outDir,
                            filename: fileName, // fluent-ffmpeg might append .png provided filename doesn't have ext? No, it respects ext.
                            size: `${size.width}x?`
                        })
                        .on('end', resolve)
                        .on('error', reject);
                });
            }

            const meta = await sharp(outPath).metadata();

            await prisma.thumbnail.upsert({
                where: {
                    mediaId_size: {
                        mediaId,
                        size: size.name
                    }
                },
                update: {
                    path: path.join(size.name, triePath + '.webp'), // Store relative path
                    width: meta.width || 0,
                    height: meta.height || 0
                },
                create: {
                    mediaId,
                    size: size.name,
                    path: path.join(size.name, triePath + '.webp'),
                    width: meta.width || 0,
                    height: meta.height || 0
                }
            });
        }

        // --- LQIP Generation ---
        const lqipSize = { name: 'lqip', width: 32 };
        const lqipDir = path.join(DATA_ROOT, 'thumbs', lqipSize.name, path.dirname(triePath));
        const lqipName = path.basename(triePath) + '.webp';
        const lqipPath = path.join(lqipDir, lqipName);

        if (!fs.existsSync(lqipDir)) {
            try {
                fs.mkdirSync(lqipDir, { recursive: true });
            } catch (e) { /* ignore race */ }
        }

        try {
            if (media.type === 'image') {
                await sharp(filePath)
                    .resize(lqipSize.width, lqipSize.width, { fit: 'inside' }) // 32x32 max
                    .blur(5) // High blur for LQIP
                    .webp({ quality: 30 }) // Low quality
                    .toFile(lqipPath);
            } else if (media.type === 'video') {
                // Extract frame then process with sharp for consistency (blur/resize)
                // Temp file for frame
                const tempFrame = path.join(lqipDir, `temp_${lqipName}.png`);

                await new Promise((resolve, reject) => {
                    ffmpeg(filePath)
                        .screenshots({
                            count: 1,
                            folder: lqipDir,
                            filename: `temp_${lqipName}.png`,
                            size: `${lqipSize.width}x?`
                        })
                        .on('end', resolve)
                        .on('error', reject);
                });

                // Process temp frame
                if (fs.existsSync(tempFrame)) {
                    await sharp(tempFrame)
                        .resize(lqipSize.width, lqipSize.width, { fit: 'inside' })
                        .blur(5)
                        .webp({ quality: 30 })
                        .toFile(lqipPath);

                    // Cleanup temp
                    fs.unlinkSync(tempFrame);
                }
            }

            const lqipMeta = await sharp(lqipPath).metadata();

            await prisma.thumbnail.upsert({
                where: {
                    mediaId_size: {
                        mediaId,
                        size: lqipSize.name
                    }
                },
                update: {
                    path: path.join(lqipSize.name, triePath + '.webp'),
                    width: lqipMeta.width || 0,
                    height: lqipMeta.height || 0
                },
                create: {
                    mediaId,
                    size: lqipSize.name,
                    path: path.join(lqipSize.name, triePath + '.webp'),
                    width: lqipMeta.width || 0,
                    height: lqipMeta.height || 0
                }
            });
        } catch (e) {
            console.error(`Failed to generate LQIP for ${mediaId}`, e);
        }
    }
}
