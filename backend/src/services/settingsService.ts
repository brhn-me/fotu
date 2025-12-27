import prisma from '../db/client';
import { DEFAULT_SETTINGS } from '../config/defaultSettings';

export interface InternalSettings {
    // Typed interface for internal backend usage
    video: {
        autoplay: boolean;
        defaultVolume: number;
        previewDuration: number;
        resolution: string;
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
    };
}

class SettingsService {
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
    }

    /**
     * Retrieves typed settings for internal service consumption.
     * This acts as a facade to parse raw DB strings into usable numbers/booleans.
     */
    async getTyped(): Promise<InternalSettings> {
        const all = await this.getAll();

        return {
            video: {
                autoplay: all.videoAutoplay === 'true',
                defaultVolume: Number(all.videoDefaultVolume || 100),
                previewDuration: Number(all.videoPreviewDuration || 4),
                resolution: all.videoResolution || '720p'
            },
            runtimes: {
                exiftool: all.exiftoolPath || '',
                ffmpeg: all.ffmpegPath || '',
                ffprobe: all.ffprobePath || '',
                darktable: all.darktableCliPath || ''
            },
            images: {
                thumbnailQuality: Number(all.thumbnailQuality || 80),
                previewQuality: Number(all.previewQuality || 90),
                thumbnailResolution: all.thumbnailResolution || '480p',
                previewResolution: all.previewResolution || '1080p'
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
