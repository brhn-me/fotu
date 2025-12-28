// src/pages/jobs/jobsIcons.ts
import {
    Search,
    Scissors,
    FileText,
    Monitor,
    Zap,
    Video,
    RefreshCw,
    FolderTree,
} from "lucide-react";
import type React from "react";

export interface Job {
    id: string;
    title: string;
    icon: React.ElementType;
    total: number;
    completed: number;
    failed: number;
    errors: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
    description: string;
}

export const JOB_ICONS: Record<string, React.ElementType> = {
    scan: Search,
    thumbs: Scissors,
    metadata: FileText,
    preview: Monitor,
    raw: Zap,
    encoding: Video,
    conversion: RefreshCw,
    organize: FolderTree,
};

