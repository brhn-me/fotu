import { AppSettings } from "../../context/SettingsContext";
import { api } from "../client";

export const settingsApi = {
    getSettings: async (): Promise<Partial<AppSettings>> => {
        return api.get<Partial<AppSettings>>('/settings');
    },

    updateSettings: async (settings: Partial<AppSettings>): Promise<void> => {
        return api.put('/settings', settings);
    }
};
