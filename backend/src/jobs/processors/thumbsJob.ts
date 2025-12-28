import { Job } from 'bullmq';
import { BaseJob } from '../baseJob';
import prisma from '../../db/client';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { getTriePath } from '../../utils/pathUtils';
import { settingsService } from '../../services/settingsService';
import { config } from '../../config';

export class ThumbsJob extends BaseJob {
    async process(job: Job) {


        const { mediaId, filePath } = job.data;

        if (!mediaId || !filePath) throw new Error('Missing mediaId or filePath');

        const media = await prisma.media.findUnique({ where: { id: mediaId } });
        if (!media) throw new Error('Media not found');

        // Fetch typed settings
        const settings = await settingsService.getTyped();

        // Helper to parse "480p" -> 480
        const parseRes = (resStr: string): number => {
            const match = resStr.match(/(\d+)p?/);
            return match ? parseInt(match[1], 10) : 240; // Default to 240 if parse fails
        };

        // console.log(`[ThumbsJob] Processing ${mediaId}. Settings: Thumb=${settings.images.thumbnailResolution}, Preview=${settings.images.previewResolution}`);

        const triePath = getTriePath(mediaId);

        // Define outputs to generate
        const outputs = [
            {
                type: 'thumbnail',
                resolution: parseRes(settings.images.thumbnailResolution),
                format: settings.images.thumbnailFormat,
                quality: settings.images.thumbnailQuality,
                label: settings.images.thumbnailResolution
            },
            {
                type: 'preview',
                resolution: parseRes(settings.images.previewResolution),
                format: settings.images.previewFormat,
                quality: settings.images.previewQuality,
                label: settings.images.previewResolution
            }
        ];

        for (const out of outputs) {
            // Path structure: <thumbsDir>/<resolution>/<trie>.<ext>
            // e.g. .cache/thumbs/480p/ab/cd/ef.webp
            const outDir = path.join(config.thumbsDir, out.label, path.dirname(triePath));
            const fileName = `${path.basename(triePath)}.${out.format}`;
            const outPath = path.join(outDir, fileName);

            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            console.log(`[ThumbsJob] Generating ${out.type} at resolution target: ${out.resolution}px. Output: ${outPath}`);

            // Processing logic
            const sharpInstance = sharp(filePath);

            // Resize (Height based, maintain aspect ratio)
            // For video, we need to extract frame first if sharp doesn't support it directly (sharp supports some, but ffmpeg is safer for frames)
            if (media.type === 'video') {
                await new Promise((resolve, reject) => {
                    ffmpeg(filePath)
                        .screenshots({
                            count: 1,
                            folder: outDir,
                            filename: `temp_${fileName}.png`,
                            size: `?x${out.resolution}`
                        })
                        .on('end', async () => {
                            // Process the temp extracted frame
                            const tempPath = path.join(outDir, `temp_${fileName}.png`);
                            try {
                                const processor = sharp(tempPath);
                                if (out.format === 'webp') {
                                    processor.webp({ quality: out.quality });
                                } else if (out.format === 'jpg' || out.format === 'jpeg') {
                                    processor.jpeg({ quality: out.quality });
                                }
                                await processor.toFile(outPath);
                                fs.unlinkSync(tempPath);
                                resolve(null);
                            } catch (e) {
                                reject(e);
                            }
                        })
                        .on('error', reject);
                });
            } else {
                // Image
                // Resize (Height based, maintain aspect ratio, do not upscale)
                sharpInstance.resize(null, out.resolution, {
                    withoutEnlargement: true
                });

                if (out.format === 'webp') {
                    sharpInstance.webp({ quality: out.quality });
                } else if (out.format === 'jpg' || out.format === 'jpeg') {
                    sharpInstance.jpeg({ quality: out.quality });
                }

                await sharpInstance.toFile(outPath);
            }

            // Save to DB
            const meta = await sharp(outPath).metadata();

            // Store with size label (e.g. '480p', '1080p')
            // Using the resolution setting string as the 'size' key in DB
            await prisma.thumbnail.upsert({
                where: {
                    mediaId_size: {
                        mediaId,
                        size: out.label
                    }
                },
                update: {
                    path: path.join(out.label, fileName),
                    width: meta.width || 0,
                    height: meta.height || 0
                },
                create: {
                    mediaId,
                    size: out.label,
                    path: path.join(out.label, fileName),
                    width: meta.width || 0,
                    height: meta.height || 0
                }
            });
        }

        // --- LQIP Generation ---
        const LQIP_HEIGHT = 32;
        const lqipSize = { name: 'lqip' };
        const lqipDir = path.join(config.thumbsDir, lqipSize.name, path.dirname(triePath));
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
                    .resize(null, LQIP_HEIGHT) // Fixed height 32
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
                            size: `?x${LQIP_HEIGHT}`
                        })
                        .on('end', resolve)
                        .on('error', reject);
                });

                // Process temp frame
                if (fs.existsSync(tempFrame)) {
                    await sharp(tempFrame)
                        .resize(null, LQIP_HEIGHT)
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
