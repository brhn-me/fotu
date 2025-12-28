import { EventEmitter } from 'events';
import prisma from '../db/client';
import { DEFAULT_SETTINGS } from '../config/defaultSettings';
import { JOBS_CONFIG } from '../config/jobsConfig';

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
    private cache: InternalSettings | null = null;
    private rawCache: Record<string, string> = {};

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
            // Initial load after seeding
            await this.load();
        } catch (error) {
            console.error('Failed to seed default settings:', error);
        }
    }

    /**
     * Loads settings from DB into memory cache.
     * Should be called on startup and after updates.
     */
    async load() {
        const settings = await prisma.settings.findMany();
        this.rawCache = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        this.cache = this.parseSettings(this.rawCache);
        this.emit('settingsUpdated', this.cache);
    }

    /**
     * Retrieves all settings as a key-value map.
     * Uses cache if available, otherwise falls back to DB.
     * Values are always strings (database format).
     */
    async getAll(): Promise<Record<string, string>> {
        if (Object.keys(this.rawCache).length === 0) {
            await this.load();
        }
        return { ...this.rawCache };
    }

    /**
     * Updates multiple settings and refreshes cache.
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
        await this.load(); // Refresh cache
        // Event emitted in load()
    }

    /**
     * Retrieves typed settings for internal service consumption.
     * Returns cached version for performance.
     */
    async getTyped(): Promise<InternalSettings> {
        if (!this.cache) {
            await this.load();
        }
        if (!this.cache) throw new Error('Failed to load settings');
        return this.cache;
    }

    private parseSettings(all: Record<string, string>): InternalSettings {
        // Parse Jobs Config
        let jobsConfig: Record<string, number> = {};
        try {
            const parsed = JSON.parse(all.jobsConcurrency || DEFAULT_SETTINGS.jobsConcurrency || '[]');
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
            rawFormats = JSON.parse(all.rawFormats || DEFAULT_SETTINGS.rawFormats || '[]');
        } catch { /* ignore */ }

        // Parse Job Delays
        // Prioritize dynamic defaults from JOBS_CONFIG if not set in DB
        const defaultDelays = Object.values(JOBS_CONFIG).reduce((acc, job) => {
            acc[job.id] = job.defaultDelay || 100;
            return acc;
        }, {} as Record<string, number>);

        let jobDelays: Record<string, number> = defaultDelays;

        try {
            const parsed = JSON.parse(all.jobDelays || '{}');
            if (typeof parsed === 'object' && parsed !== null) {
                // Merge DB values over defaults
                jobDelays = { ...defaultDelays, ...parsed };
            }
        } catch { /* ignore */ }

        return {
            core: {
                albumStructure: all.albumStructure || DEFAULT_SETTINGS.albumStructure || '{yyyy}/{mm}'
            },
            jobs: jobsConfig,
            jobDelays: jobDelays,
            jobDelay: Number(all.jobDelay || 100),
            raw: {
                formats: rawFormats,
                darktableEnabled: all.darktableEnabled === 'true', // Defaults to false per file string
                sidecarEnabled: all.useSidecar === 'true'
            },
            video: {
                autoplay: all.videoAutoplay === 'true',
                defaultVolume: Number(all.videoDefaultVolume || DEFAULT_SETTINGS.videoDefaultVolume),
                previewDuration: Number(all.videoPreviewDuration || DEFAULT_SETTINGS.videoPreviewDuration),
                resolution: all.videoResolution || DEFAULT_SETTINGS.videoResolution,
                encoder: all.videoEncoder || DEFAULT_SETTINGS.videoEncoder
            },
            runtimes: {
                exiftool: all.exiftoolPath || '',
                ffmpeg: all.ffmpegPath || '',
                ffprobe: all.ffprobePath || '',
                darktable: all.darktableCliPath || ''
            },
            images: {
                thumbnailQuality: Number(all.thumbnailQuality || DEFAULT_SETTINGS.thumbnailQuality),
                previewQuality: Number(all.previewQuality || DEFAULT_SETTINGS.previewQuality),
                thumbnailResolution: all.thumbnailResolution || DEFAULT_SETTINGS.thumbnailResolution,
                previewResolution: all.previewResolution || DEFAULT_SETTINGS.previewResolution,
                thumbnailFormat: all.thumbnailFormat || DEFAULT_SETTINGS.thumbnailFormat,
                previewFormat: all.previewFormat || DEFAULT_SETTINGS.previewFormat,
                encoder: all.imageEncoder || DEFAULT_SETTINGS.imageEncoder
            }
        };
    }

    // Alias for backward compatibility if needed, using generic string
    async get(key: string): Promise<string | null> {
        if (this.rawCache[key] !== undefined) {
            return this.rawCache[key];
        }
        // Fallback to DB if somehow not in cache (unlikely if loaded)
        const item = await prisma.settings.findUnique({ where: { key } });
        return item?.value || null;
    }
}

export const settingsService = new SettingsService();
// We'll call settingsService.load() explicitly in main.ts
export const seedDefaultSettings = settingsService.seedDefaults.bind(settingsService);
