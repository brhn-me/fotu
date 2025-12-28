import { io, Socket } from 'socket.io-client';
import { api } from '../api/client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface JobDefinition {
    id: string;
    title: string;
    description: string;
}

export interface JobState {
    id: string; // Matches definition id
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
    progress: number; // 0-100
    total: number;
    completed: number;
    failed: number;
    errors: number;
}

class JobsService {
    private socket: Socket | null = null;

    async getConfig(): Promise<Record<string, JobDefinition>> {
        return api.get('/jobs/config');
    }

    async performAction(jobId: string, action: 'start' | 'pause' | 'resume' | 'stop') {
        return api.post(`/jobs/${jobId}/action`, { action });
    }

    connectSocket(onUpdate: (data: any) => void) {
        if (this.socket) return this.socket;

        if (this.socket) return this.socket;

        this.socket = io(SOCKET_URL);

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('job:update', (data) => {
            onUpdate(data);
        });

        return this.socket;
    }

    disconnectSocket() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const jobsService = new JobsService();
