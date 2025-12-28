export interface JobDefinition {
    id: string;
    title: string;
    description: string;
    defaultDelay?: number;
}

export const JOBS_CONFIG: Record<string, JobDefinition> = {
    scan: {
        id: "scan",
        title: "Scan",
        description: "Scans sources and syncs changes into the database.",
        defaultDelay: 100
    },
    thumbs: {
        id: "thumbs",
        title: "Thumbnail Generation",
        description: "Generates cached thumbnails for fast gallery browsing.",
        defaultDelay: 1000
    },
    metadata: {
        id: "metadata",
        title: "MetaData Extraction",
        description: "Extracts EXIF/IPTC/XMP (date, camera, GPS) for indexing.",
        defaultDelay: 500
    },
    preview: {
        id: "preview",
        title: "Preview Generation",
        description: "Builds web previews for high-quality viewing without originals.",
        defaultDelay: 2000
    },
    raw: {
        id: "raw",
        title: "Raw Conversion",
        description: "Converts RAW to viewable previews using standard profiles.",
        defaultDelay: 100
    },
    encoding: {
        id: "encoding",
        title: "Video Encoding",
        description: "Transcodes to H.264 renditions for smooth playback.",
        defaultDelay: 5000
    },
    conversion: {
        id: "conversion",
        title: "Image Conversion",
        description: "Converts images to efficient web formats such as WebP.",
        defaultDelay: 3000
    },
    organize: {
        id: "organize",
        title: "Organization",
        description: "Generates album suggestions and basic categories.",
        defaultDelay: 1000
    }
};

export type JobType = keyof typeof JOBS_CONFIG;
