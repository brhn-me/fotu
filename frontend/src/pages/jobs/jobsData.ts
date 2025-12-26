// src/data/jobsData.ts
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
import type React from "react";
import type { Job } from "./JobsPage";

export const JOBS_DATA: Job[] = [
    { id: "scan", title: "Scan", icon: Search as React.ElementType, total: 1000, completed: 850, failed: 5, errors: 2, status: "running", description: "Scans sources and syncs changes into the database." },
    { id: "hash", title: "Hashing", icon: Fingerprint as React.ElementType, total: 1000, completed: 420, failed: 0, errors: 0, status: "running", description: "Computes hashes for dedupe, move detection, and integrity checks." },
    { id: "thumbs", title: "Thumbnail Generation", icon: Scissors as React.ElementType, total: 1000, completed: 150, failed: 12, errors: 4, status: "running", description: "Generates cached thumbnails for fast gallery browsing." },
    { id: "metadata", title: "MetaData Extraction", icon: FileText as React.ElementType, total: 1000, completed: 0, failed: 0, errors: 0, status: "paused", description: "Extracts EXIF/IPTC/XMP (date, camera, GPS) for indexing." },
    { id: "preview", title: "Preview Generation", icon: Monitor as React.ElementType, total: 1000, completed: 0, failed: 0, errors: 0, status: "paused", description: "Builds web previews for high-quality viewing without originals." },
    { id: "raw", title: "Raw Conversion", icon: Zap as React.ElementType, total: 50, completed: 0, failed: 0, errors: 0, status: "paused", description: "Converts RAW to viewable previews using standard profiles." },
    { id: "encoding", title: "Video Encoding", icon: Video as React.ElementType, total: 20, completed: 5, failed: 1, errors: 0, status: "running", description: "Transcodes to H.264 renditions for smooth playback." },
    { id: "conversion", title: "Image Conversion", icon: RefreshCw as React.ElementType, total: 300, completed: 300, failed: 0, errors: 0, status: "completed", description: "Converts images to efficient web formats such as WebP." },
    { id: "organize", title: "Organization", icon: FolderTree as React.ElementType, total: 500, completed: 450, failed: 2, errors: 1, status: "running", description: "Generates album suggestions and basic categories." },
];
