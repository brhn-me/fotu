import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { JOBS_CONFIG } from './jobsConfig';

const CONFIG_PATH = path.join(process.cwd(), 'config.yml');

// Load defaults from YAML file
let defaults: Record<string, string>;

try {
    const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
    defaults = yaml.load(fileContents) as Record<string, string>;
} catch (e) {
    console.error(`Failed to load config.yml from ${CONFIG_PATH}`, e);
    // Fallback? Or fail hard? Failing hard is probably safer for "seeding" logic 
    // but let's provide a minimal fallback to avoid crash if file is missing during dev
    defaults = {};
}

// Merge or set factory defaults if not present
const defaultValues: Record<string, string> = {
    // Images
    thumbnailFormat: 'webp',
    thumbnailResolution: '240p',
    thumbnailQuality: '80',
    previewFormat: 'webp',
    previewResolution: '1080p',
    previewQuality: '90',

    // Encoders
    imageEncoder: 'webp',
    videoEncoder: 'h264',

    // Jobs
    jobsConcurrency: '[]',
    jobDelays: JSON.stringify(
        Object.values(JOBS_CONFIG).reduce((acc, job) => {
            acc[job.id] = job.defaultDelay || 100;
            return acc;
        }, {} as Record<string, number>)
    ),

    // Raw
    rawFormats: '["GPR", "NEF", "CR2", "CR3", "ARW", "RAF", "ORF", "DNG"]',
    darktableEnabled: 'false',
    useSidecar: 'false',

    // Video
    videoAutoplay: 'true',
    videoDefaultVolume: '100',
    videoPreviewDuration: '4',
    videoResolution: '240p',

    // Organization
    albumStructure: '{yyyy}/{yyyy-mm-dd}',

    // Runtimes
    exiftoolPath: '',
    ffmpegPath: '',
    ffprobePath: '',
    darktableCliPath: ''
};

// Apply defaults for missing keys
Object.entries(defaultValues).forEach(([key, val]) => {
    if (defaults[key] === undefined) {
        defaults[key] = val;
    }
});

export const DEFAULT_SETTINGS = defaults;
