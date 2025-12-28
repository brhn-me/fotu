import { Job } from 'bullmq';
import { BaseJob } from '../baseJob';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { getTriePath } from '../../utils/pathUtils';
import { settingsService } from '../../services/settingsService';

const DATA_ROOT = process.env.FOTU_DATA_DIR || path.join(process.cwd(), '.cache');

export class PreviewJob extends BaseJob {
    async process(job: Job) {
        // SISULATION DELAY: 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));

        const { mediaId, filePath } = job.data;

        if (!mediaId || !filePath) throw new Error('Missing mediaId or filePath');

        // Fetch settings
        const settings = await settingsService.getAll();
        const resolutionsStr = settings['videoResolutions'];
        let resolutions = [
            { name: '480p', height: 480 }, // Fallback
            { name: '720p', height: 720 }
        ];

        if (resolutionsStr) {
            try {
                resolutions = JSON.parse(resolutionsStr);
            } catch (e) {
                console.warn('Failed to parse videoResolutions setting, using defaults');
            }
        }

        const triePath = getTriePath(mediaId);
        // Desired output: DATA_ROOT/previews/<resolution.name>/<triePath>.mp4

        for (const res of resolutions) {
            const outDir = path.join(DATA_ROOT, 'previews', res.name, path.dirname(triePath));
            const fileName = path.basename(triePath) + '.mp4';
            const outPath = path.join(outDir, fileName);

            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            // Transcode
            await new Promise((resolve, reject) => {
                ffmpeg(filePath)
                    .output(outPath)
                    .size(`?x${res.height}`) // Scale height, keep aspect ratio
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .format('mp4')
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });
        }
    }
}
