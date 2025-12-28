import { io, Socket } from 'socket.io-client';

const API_Base = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

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
        const res = await fetch(`${API_Base}/api/jobs/config`);
        if (!res.ok) throw new Error('Failed to fetch jobs config');
        return res.json();
    }

    async performAction(jobId: string, action: 'start' | 'pause' | 'resume' | 'stop') {
        const res = await fetch(`${API_Base}/api/jobs/${jobId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        if (!res.ok) throw new Error(`Failed to ${action} job`);
        return res.json();
    }

    connectSocket(onUpdate: (data: any) => void) {
        if (this.socket) return this.socket;

        this.socket = io(API_Base);

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
