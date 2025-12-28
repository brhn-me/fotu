export interface RuntimeInfo {
    key: string;
    name: string;
    found: boolean;
    path: string | null;
}

import { api } from "../client";

export const runtimesApi = {
    getRuntimes: async (): Promise<RuntimeInfo[]> => {
        return api.get<RuntimeInfo[]>('/runtimes');
    },
    verifyRuntime: async (path: string): Promise<{ valid: boolean }> => {
        return api.post<{ valid: boolean }>('/runtimes/verify', { path });
    }
};
