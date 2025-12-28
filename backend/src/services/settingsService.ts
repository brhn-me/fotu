import { EventEmitter } from 'events';
import prisma from '../db/client';
import { DEFAULT_SETTINGS } from '../config/defaultSettings';

export interface InternalSettings {
    core: {
        albumStructure: string;
    };
    jobs: Record<string, number>;
    jobDelays: Record<string, number>;
    jobDelay: number; // Keep for backward compat if needed, or remove?
    raw: {
        formats: string[];
        darktableEnabled: boolean;
        sidecarEnabled: boolean;
    };
    video: {
        autoplay: boolean;
        defaultVolume: number;
        previewDuration: number;
        resolution: string;
        encoder: string;
    };
    runtimes: {
        exiftool: string;
        ffmpeg: string;
        ffprobe: string;
        darktable: string;
    };
    images: {
        thumbnailQuality: number;
        previewQuality: number;
        thumbnailResolution: string;
        previewResolution: string;
        thumbnailFormat: string;
        previewFormat: string;
        encoder: string;
    };
}

class SettingsService extends EventEmitter {
    /**
     * Seeds default settings into the database if they don't exist.
     */
    async seedDefaults() {
        console.log('Seeding default settings...');
        const operations = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => {
            return prisma.settings.upsert({
                where: { key },
                update: {}, // Do nothing if exists
                create: { key, value: String(value) },
            });
        });

        try {
            await prisma.$transaction(operations);
            console.log('Default settings seeded successfully.');
        } catch (error) {
            console.error('Failed to seed default settings:', error);
        }
    }

    /**
     * Retrieves all settings as a key-value map.
     * Values are always strings (database format).
     */
    async getAll(): Promise<Record<string, string>> {
        const settings = await prisma.settings.findMany();
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
    }

    /**
     * Updates multiple settings.
     */
    async update(updates: Record<string, any>): Promise<void> {
        const operations = Object.entries(updates).map(([key, value]) => {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            return prisma.settings.upsert({
                where: { key },
                update: { value: stringValue },
                create: { key, value: stringValue },
            });
        });

        await prisma.$transaction(operations);
        this.emit('settingsUpdated');
    }

    /**
     * Retrieves typed settings for internal service consumption.
     * This acts as a facade to parse raw DB strings into usable numbers/booleans.
     */
    async getTyped(): Promise<InternalSettings> {
        const all = await this.getAll();

        // Parse Jobs Config
        let jobsConfig: Record<string, number> = {};
        try {
            const parsed = JSON.parse(all.jobsConcurrency || '[]');
            if (Array.isArray(parsed)) {
                parsed.forEach((p: any) => {
                    if (p.id && typeof p.concurrency === 'number') {
                        jobsConfig[p.id] = p.concurrency;
                    }
                });
            }
        } catch { /* ignore */ }

        // Parse Raw Formats
        let rawFormats: string[] = [];
        try {
            rawFormats = JSON.parse(all.rawFormats || '[]');
        } catch { /* ignore */ }

        // Parse Job Delays
        let jobDelays: Record<string, number> = {};
        try {
            const parsed = JSON.parse(all.jobDelays || '{}');
            if (typeof parsed === 'object' && parsed !== null) {
                jobDelays = parsed;
            }
        } catch { /* ignore */ }

        return {
            core: {
                albumStructure: all.albumStructure || '{yyyy}/{mm}'
            },
            jobs: jobsConfig,
            jobDelays: jobDelays,
            jobDelay: Number(all.jobDelay || 100),
            raw: {
                formats: rawFormats,
                darktableEnabled: all.darktableEnabled === 'true',
                sidecarEnabled: all.useSidecar === 'true'
            },
            video: {
                autoplay: all.videoAutoplay === 'true',
                defaultVolume: Number(all.videoDefaultVolume || 100),
                previewDuration: Number(all.videoPreviewDuration || 4),
                resolution: all.videoResolution || '240p',
                encoder: all.videoEncoder || 'h264'
            },
            runtimes: {
                exiftool: all.exiftoolPath || '',
                ffmpeg: all.ffmpegPath || '',
                ffprobe: all.ffprobePath || '',
                darktable: all.darktableCliPath || ''
            },
            images: {
                thumbnailQuality: Number(all.thumbnailQuality || 70),
                previewQuality: Number(all.previewQuality || 80),
                thumbnailResolution: all.thumbnailResolution || '240p',
                previewResolution: all.previewResolution || '1080p',
                thumbnailFormat: all.thumbnailFormat || 'webp',
                previewFormat: all.previewFormat || 'webp',
                encoder: all.imageEncoder || 'webp'
            }
        };
    }

    // Alias for backward compatibility if needed, using generic string
    async get(key: string): Promise<string | null> {
        const item = await prisma.settings.findUnique({ where: { key } });
        return item?.value || null;
    }
}

export const settingsService = new SettingsService();
export const seedDefaultSettings = settingsService.seedDefaults.bind(settingsService);
