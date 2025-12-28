import { Job } from 'bullmq';
import { BaseJob } from '../baseJob';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { getTriePath } from '../../utils/pathUtils';
import { settingsService } from '../../services/settingsService';
import { config } from '../../config';

export class PreviewJob extends BaseJob {
    async process(job: Job) {


        const { mediaId, filePath } = job.data;

        if (!mediaId || !filePath) throw new Error('Missing mediaId or filePath');

        // Fetch settings
        // Fetch settings
        const settings = await settingsService.getTyped();
        const resolution = settings.video.resolution || '240p';
        const duration = settings.video.previewDuration || 4;

        // Parse height from resolution string (e.g. "720p" -> 720)
        const heightMatch = resolution.match(/(\d+)/);
        const targetHeight = heightMatch ? parseInt(heightMatch[1], 10) : 240;

        const triePath = getTriePath(mediaId);
        // Desired output: <previewsDir>/<resolution>/<triePath>.mp4
        // Uses the resolution label from settings as the folder name

        const outDir = path.join(config.previewsDir, resolution, path.dirname(triePath));
        const fileName = path.basename(triePath) + '.mp4';
        const outPath = path.join(outDir, fileName);

        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        // Transcode
        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .output(outPath)
                .duration(duration) // Limit duration
                .size(`?x${targetHeight}`) // Scale height, keep aspect ratio
                .videoCodec('libx264')
                .audioCodec('aac')
                .format('mp4')
                // Basic flags for compatibility
                .outputOptions('-pix_fmt yuv420p')
                .outputOptions('-movflags +faststart')
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
    }
}
