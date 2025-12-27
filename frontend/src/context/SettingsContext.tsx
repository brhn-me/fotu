import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { settingsApi } from '../api/settings';

// Define the shape of our settings
export interface AppSettings {
    // Images
    thumbnailFormat: string;
    thumbnailResolution: string;
    thumbnailQuality: number;
    previewFormat: string;
    previewResolution: string;
    previewQuality: number;

    // Encoding
    imageEncoder: string;
    videoEncoder: string;

    // Jobs (JSON stringified)
    jobsConcurrency: string;

    // Raw
    rawFormats: string; // JSON Array
    darktableEnabled: boolean;
    useSidecar: boolean;

    // Video
    videoAutoplay: boolean;
    videoDefaultVolume: number;
    videoPreviewDuration: number;
    videoResolution: string;

    // Runtimes
    exiftoolPath: string;
    ffmpegPath: string;
    ffprobePath: string;
    darktableCliPath: string;

    // Organization
    albumStructure: string;
}

const DEFAULT_SETTINGS: AppSettings = {
    thumbnailFormat: 'webp',
    thumbnailResolution: '480p',
    thumbnailQuality: 80,
    previewFormat: 'webp',
    previewResolution: '1080p',
    previewQuality: 90,
    imageEncoder: 'webp',
    videoEncoder: 'h264',
    jobsConcurrency: '[]',
    rawFormats: '["GPR", "NEF", "CR2", "CR3", "ARW", "RAF", "ORF", "DNG"]',
    darktableEnabled: false,
    useSidecar: false,
    videoAutoplay: true,
    videoDefaultVolume: 100,
    videoPreviewDuration: 4,
    videoResolution: '720p',
    albumStructure: '{yyyy}/{yyyy-mm-dd}',
    exiftoolPath: '',
    ffmpegPath: '',
    ffprobePath: '',
    darktableCliPath: ''
};

interface SettingsContextType {
    settings: AppSettings;
    isLoading: boolean;
    updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const data = await settingsApi.getSettings();
            // Merge with defaults to handle missing keys
            setSettings(prev => ({
                ...prev,
                ...data,
                // Ensure number types are actually numbers (API returns strings for map values possibly if we aren't careful,
                // but our backend treats everything as string currently. We need to parse.)
                // Wait, backend `findMany` returns generic key/value strings.
                // We need to parse appropriate fields if they are numbers or booleans.
                thumbnailQuality: Number(data.thumbnailQuality ?? prev.thumbnailQuality),
                previewQuality: Number(data.previewQuality ?? prev.previewQuality),
                videoAutoplay: String(data.videoAutoplay) === 'true', // Handle string persist
                videoDefaultVolume: Number(data.videoDefaultVolume ?? prev.videoDefaultVolume),
                videoPreviewDuration: Number(data.videoPreviewDuration ?? prev.videoPreviewDuration),
                darktableEnabled: String(data.darktableEnabled) === 'true',
                useSidecar: String(data.useSidecar) === 'true',
            }));
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: Partial<AppSettings>) => {
        // Optimistic update
        setSettings(prev => ({ ...prev, ...newSettings }));

        try {
            await settingsApi.updateSettings(newSettings);
            toast.success("Settings saved");
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error("Failed to save settings");
            fetchSettings();
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, isLoading, updateSettings, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
}
