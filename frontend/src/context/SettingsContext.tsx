import React, { createContext, useContext, useState, useEffect } from 'react';

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
    rawFormats: '["GPR", "NEF", "CR2", "CR3", "ARW", "RAF", "ORF", "DNG"]'
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
            const res = await fetch('http://localhost:3000/api/settings');
            if (res.ok) {
                const data = await res.json();
                // Merge with defaults to handle missing keys
                setSettings(prev => ({ ...prev, ...data }));
            }
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
            const res = await fetch('http://localhost:3000/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });

            if (!res.ok) throw new Error('Failed to save settings');
        } catch (error) {
            console.error('Failed to save settings:', error);
            // Revert on error? For now, we just log, but in robust app we'd revert.
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
