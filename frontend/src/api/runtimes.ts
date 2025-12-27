export interface RuntimeInfo {
    key: string;
    name: string;
    found: boolean;
    path: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const runtimesApi = {
    getRuntimes: async (): Promise<RuntimeInfo[]> => {
        const response = await fetch(`${API_URL}/runtimes`);
        if (!response.ok) {
            throw new Error('Failed to fetch runtimes');
        }
        return response.json();
    }
};
