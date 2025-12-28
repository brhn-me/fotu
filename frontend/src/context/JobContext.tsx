import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Job } from "../pages/jobs/JobsPage";

interface JobContextType {
    jobs: Job[];
    toggleJobStatus: (id: string) => void;
    restartJob: (id: string) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

import {
    Search,
    Fingerprint,
    Scissors,
    FileText,
    Monitor,
    Zap,
    Video,
    RefreshCw,
    FolderTree,
} from "lucide-react";
import { jobsService, JobState } from "../services/jobsService";

// Map IDs to Icons
const ICON_MAP: Record<string, React.ElementType> = {
    scan: Search,
    hash: Fingerprint,
    thumbs: Scissors,
    metadata: FileText,
    preview: Monitor,
    raw: Zap,
    encoding: Video,
    conversion: RefreshCw,
    organize: FolderTree,
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Fetch Config
                const config = await jobsService.getConfig();

                // 2. Initial State (could be fetched from API if we persist run state, 
                // for now defaulting to 0 progress)
                const initialJobs: Job[] = Object.values(config).map(def => ({
                    id: def.id,
                    title: def.title,
                    description: def.description,
                    icon: ICON_MAP[def.id] || Search,
                    status: 'pending', // Default
                    total: 0,
                    completed: 0,
                    failed: 0,
                    errors: 0
                }));
                setJobs(initialJobs);

                // 3. Connect Socket
                jobsService.connectSocket((data: JobState) => {
                    setJobs(prev => prev.map(job => {
                        if (job.id === data.id) {
                            return { ...job, ...data, icon: job.icon }; // Keep icon
                        }
                        return job;
                    }));
                });
            } catch (err) {
                console.error("Failed to init jobs:", err);
            }
        };

        init();
        return () => jobsService.disconnectSocket();
    }, []);

    const toggleJobStatus = useCallback(async (id: string) => {
        const job = jobs.find(j => j.id === id);
        if (!job) return;

        const action = job.status === 'running' ? 'pause' : 'resume';
        // Optimistic update
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status: action === 'pause' ? 'paused' : 'running' } : j));

        try {
            await jobsService.performAction(id, action);
        } catch (err) {
            console.error(err);
            // Revert?
        }
    }, [jobs]);

    const restartJob = useCallback(async (id: string) => {
        // Optimistic
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'running', completed: 0, failed: 0, total: 0 } : j));
        try {
            await jobsService.performAction(id, 'start');
        } catch (err) {
            console.error(err);
        }
    }, []);

    return (
        <JobContext.Provider value={{ jobs, toggleJobStatus, restartJob }}>
            {children}
        </JobContext.Provider>
    );
};

export const useJobs = () => {
    const context = useContext(JobContext);
    if (!context) {
        throw new Error("useJobs must be used within a JobProvider");
    }
    return context;
};
