export interface JobDefinition {
    id: string;
    title: string;
    description: string;
}

export const JOBS_CONFIG: Record<string, JobDefinition> = {
    scan: {
        id: "scan",
        title: "Scan",
        description: "Scans sources and syncs changes into the database."
    },
    thumbs: {
        id: "thumbs",
        title: "Thumbnail Generation",
        description: "Generates cached thumbnails for fast gallery browsing."
    },
    metadata: {
        id: "metadata",
        title: "MetaData Extraction",
        description: "Extracts EXIF/IPTC/XMP (date, camera, GPS) for indexing."
    },
    preview: {
        id: "preview",
        title: "Preview Generation",
        description: "Builds web previews for high-quality viewing without originals."
    },
    raw: {
        id: "raw",
        title: "Raw Conversion",
        description: "Converts RAW to viewable previews using standard profiles."
    },
    encoding: {
        id: "encoding",
        title: "Video Encoding",
        description: "Transcodes to H.264 renditions for smooth playback."
    },
    conversion: {
        id: "conversion",
        title: "Image Conversion",
        description: "Converts images to efficient web formats such as WebP."
    },
    organize: {
        id: "organize",
        title: "Organization",
        description: "Generates album suggestions and basic categories."
    }
};

export type JobType = keyof typeof JOBS_CONFIG;
