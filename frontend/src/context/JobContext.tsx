import React, { createContext, useContext, useState, useCallback } from "react";
import { JOBS_DATA } from "../pages/jobs/jobsData";
import { Job } from "../pages/jobs/JobsPage";

interface JobContextType {
    jobs: Job[];
    toggleJobStatus: (id: string) => void;
    restartJob: (id: string) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [jobs, setJobs] = useState<Job[]>(JOBS_DATA);

    const toggleJobStatus = useCallback((id: string) => {
        setJobs((prev) =>
            prev.map((job) => {
                if (job.id !== id) return job;
                if (job.status === "completed") return job;
                return { ...job, status: job.status === "running" ? "paused" : "running" };
            })
        );
    }, []);

    const restartJob = useCallback((id: string) => {
        setJobs((prev) =>
            prev.map((job) => {
                if (job.id !== id) return job;
                return { ...job, completed: 0, failed: 0, errors: 0, status: "running" };
            })
        );
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
