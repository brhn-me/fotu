import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { api } from '../api/client';

export interface SystemStats {
    photos: number;
    videos: number;
    totalFiles: number;
    usageBytes: string; // serialized BigInt
    usageGB: number;
    freeBytes: string;
    totalBytes: string;
    freeGB: number;
    totalGB: number;
}

export function useStats() {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const { socket } = useSocket();

    const fetchStats = async () => {
        try {
            const data = await api.get<SystemStats>('/stats');
            setStats(data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    useEffect(() => {
        fetchStats();

        if (socket) {
            socket.on('stats-updated', fetchStats);
        }

        return () => {
            if (socket) {
                socket.off('stats-updated', fetchStats);
            }
        };
    }, [socket]);

    return stats;
}
