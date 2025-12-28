import { Job } from 'bullmq';
import { BaseJob } from '../baseJob';
import prisma from '../../db/client';
import ffmpeg from 'fluent-ffmpeg';
import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { exiftool } from 'exiftool-vendored';

export class MetadataJob extends BaseJob {
    async process(job: Job) {


        const { mediaId, fileId, filePath } = job.data;

        if (!mediaId || !filePath) throw new Error('Missing mediaId or filePath');

        const mediaFile = await prisma.file.findUnique({ where: { id: fileId } });
        if (!mediaFile) throw new Error('File not found');

        const media = await prisma.media.findUnique({
            where: { id: mediaId },
            include: { metadata: true }
        });

        if (!media) throw new Error('Media not found');

        let metadata: any = media.metadata?.raw || {};
        let width = media.metadata?.width;
        let height = media.metadata?.height;
        let duration = media.metadata?.duration;
        let dateTaken = media.metadata?.dateTaken;

        // Initialize new fields
        let make: string | undefined;
        let model: string | undefined;
        let lens: string | undefined;
        let iso: number | undefined;
        let fNumber: number | undefined;
        let exposureTime: number | undefined;
        let fps: number | undefined;
        let codec: string | undefined;
        let bitrate: number | undefined;

        // 1. Basic Extraction
        if (media.type === 'image') {
            try {
                const tags = await exiftool.read(filePath);

                // Extract dimensions if available
                if (tags.ImageWidth) width = tags.ImageWidth;
                if (tags.ImageHeight) height = tags.ImageHeight;

                // Extract date taken
                if (tags.DateTimeOriginal) {
                    // exiftool returns ExifDateTime object or string
                    // We need to handle it safely.
                    // tags.DateTimeOriginal can be used directly often but let's check
                    const dt = tags.DateTimeOriginal as any; // Type assertion for simplicity
                    if (dt && typeof dt.toDate === 'function') {
                        dateTaken = dt.toDate();
                    } else if (typeof dt === 'string') {
                        dateTaken = new Date(dt);
                    }
                }

                // Map new fields
                // Ensure string fields are actually strings (ExifTool can return numbers for Model/Make)
                make = tags.Make ? String(tags.Make) : undefined;
                model = tags.Model ? String(tags.Model) : undefined;
                lens = (tags.LensModel || tags.Lens) ? String(tags.LensModel || tags.Lens) : undefined;
                iso = tags.ISO;
                fNumber = tags.FNumber;
                // Handle ExposureTime safe parsing
                if (typeof tags.ExposureTime === 'number') {
                    exposureTime = tags.ExposureTime;
                } else if (typeof tags.ExposureTime === 'string') {
                    // Can be "1/60", "0.016", etc.
                    // exiftool-vendored usually tries to return number but sometimes string
                    // Let's use specific fractional or float parsing if needed, or simple parseFloat
                    // If it's a fraction "1/60"
                    if (tags.ExposureTime.includes('/')) {
                        const parts = tags.ExposureTime.split('/');
                        if (parts.length === 2) {
                            exposureTime = parseFloat(parts[0]) / parseFloat(parts[1]);
                        }
                    } else {
                        exposureTime = parseFloat(tags.ExposureTime);
                    }
                }

                metadata = { ...metadata, exiftool: tags };
            } catch (err) {
                console.error(`ExifTool failed for ${filePath}:`, err);
            }
        } else if (media.type === 'video') {
            const data = await new Promise<any>((resolve, reject) => {
                ffmpeg.ffprobe(filePath, (err, metadata) => {
                    if (err) reject(err);
                    else resolve(metadata);
                });
            });

            const stream = data.streams.find((s: any) => s.codec_type === 'video');
            if (stream) {
                width = stream.width;
                height = stream.height;
                duration = data.format.duration ? parseFloat(data.format.duration) : 0;

                // Add enhanced video info to metadata
                codec = stream.codec_name ? String(stream.codec_name) : undefined;
                bitrate = parseInt(data.format.bit_rate || '0', 10);
                try {
                    fps = eval(stream.r_frame_rate);
                } catch (e) { }

                // Use videoInfo for raw metadata too if needed, but we save individual fields now
                const videoInfo = {
                    codec: stream.codec_name,
                    profile: stream.profile,
                    level: stream.level,
                    pix_fmt: stream.pix_fmt,
                    bit_rate: bitrate,
                    fps: fps
                };

                metadata = { ...metadata, ffprobe: data, video: videoInfo };
            }
        }

        // 2. Sidecar Scaning
        // Look for any file in the same directory with same basename + .xmp or .xml
        // We can query the DB for potential sidecars
        if (mediaFile.parentId && mediaFile.name) {
            const baseName = mediaFile.name.substring(0, mediaFile.name.lastIndexOf('.'));
            // Sidecar candidates: basename.xmp, basename.xml, or filename.xmp
            const candidates = [
                `${baseName}.xmp`,
                `${baseName}.xml`,
                `${mediaFile.name}.xmp`,
                `${mediaFile.name}.xml`
            ];

            const sidecarFile = await prisma.file.findFirst({
                where: {
                    parentId: mediaFile.parentId,
                    name: { in: candidates }
                }
            });

            if (sidecarFile) {
                // Check if file physically exists and parse it
                if (existsSync(sidecarFile.path)) {
                    try {
                        const xmlData = await fs.readFile(sidecarFile.path, 'utf-8');
                        const parser = new XMLParser({ ignoreAttributes: false });
                        const parsed = parser.parse(xmlData);

                        metadata = { ...metadata, sidecar: parsed };

                        await prisma.metadata.upsert({
                            where: { mediaId },
                            create: {
                                mediaId,
                                width, height, duration, dateTaken,
                                make, model, lens, iso, fNumber, exposureTime, fps, codec, bitrate,
                                raw: metadata,
                                sidecarFileId: sidecarFile.id
                            },
                            update: {
                                width, height, duration, dateTaken,
                                make, model, lens, iso, fNumber, exposureTime, fps, codec, bitrate,
                                raw: metadata,
                                sidecarFileId: sidecarFile.id
                            }
                        });
                        return; // Done
                    } catch (e) {
                        console.error('Failed to parse sidecar', e);
                    }
                }
            }
        }

        // Fallback update if no sidecar or failed
        await prisma.metadata.upsert({
            where: { mediaId },
            create: {
                mediaId,
                width, height, duration, dateTaken,
                make, model, lens, iso, fNumber, exposureTime, fps, codec, bitrate,
                raw: metadata
            },
            update: {
                width, height, duration, dateTaken,
                make, model, lens, iso, fNumber, exposureTime, fps, codec, bitrate,
                raw: metadata
            }
        });

        // Cleanup
        if (media.type === 'image') {
            // Exiftool singleton might not need explicit cleanup per job, 
            // but graceful shutdown should handle end()
        }
    }
}
