export interface JobDefinition {
    id: string;
    title: string;
    description: string;
    defaultDelay?: number;
    defaultConcurrency: number;
    dependents?: string[]; // List of Job IDs that depend on this job
}

export const JOBS_CONFIG: Record<string, JobDefinition> = {
    scan: {
        id: "scan",
        title: "Scan",
        description: "Scans sources directories for images and videos",
        defaultDelay: 100,
        defaultConcurrency: 1, // Scan is sequential to avoid IO trashing and locking
        dependents: ["thumbs", "metadata", "preview", "conversion", "encoding", "raw", "organize"]
    },
    thumbs: {
        id: "thumbs",
        title: "Thumbnail Generation",
        description: "Generates thumbnails for faster gallery browsing",
        defaultDelay: 1000,
        defaultConcurrency: 4
    },
    metadata: {
        id: "metadata",
        title: "MetaData Extraction",
        description: "Extracts metadata from images and videos.",
        defaultDelay: 500,
        defaultConcurrency: 4
    },
    preview: {
        id: "preview",
        title: "Preview Generation",
        description: "Generates short preview for videos.",
        defaultDelay: 2000,
        defaultConcurrency: 2 // Expensive CPU task
    },
    raw: {
        id: "raw",
        title: "Raw Conversion",
        description: "Converts RAW files to standard formats.",
        defaultDelay: 100,
        defaultConcurrency: 2
    },
    encoding: {
        id: "encoding",
        title: "Video Encoding",
        description: "Transcodes to H.264 for smooth playback.",
        defaultDelay: 5000,
        defaultConcurrency: 1 // Very expensive CPU task
    },
    conversion: {
        id: "conversion",
        title: "Image Conversion",
        description: "Converts images to efficient web formats such as WebP or AVIF",
        defaultDelay: 3000,
        defaultConcurrency: 4
    },
    organize: {
        id: "organize",
        title: "Organization",
        description: "Organizes media files into albums directories.",
        defaultDelay: 1000,
        defaultConcurrency: 1 // Logical sequential task
    }
};

export type JobType = keyof typeof JOBS_CONFIG;
