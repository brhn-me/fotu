import { AppSettings } from "../context/SettingsContext";

const API_URL = 'http://localhost:3000/api';

export const settingsApi = {
    getSettings: async (): Promise<Partial<AppSettings>> => {
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) {
            throw new Error('Failed to fetch settings');
        }
        return response.json();
    },

    updateSettings: async (settings: Partial<AppSettings>): Promise<void> => {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            throw new Error('Failed to update settings');
        }
    }
};
