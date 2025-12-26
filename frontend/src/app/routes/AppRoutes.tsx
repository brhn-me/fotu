import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";
import { GalleryPage } from "../../pages/gallery/GalleryPage";
import { SourcesPage } from "../../pages/sources/SourcesPage";
import { MetadataPage } from "../../pages/metadata/MetadataPage";
import { JobsPage } from "../../pages/jobs/JobsPage";
import { JobDetailsPage } from "../../pages/jobs/JobDetailsPage";
import { SettingsPage } from "../../pages/settings/SettingsPage";
import { ProfilePage } from "../../pages/profile/ProfilePage";
import { AccountsPage } from "../../pages/accounts/AccountsPage";
import { MapPage } from "../../pages/map/MapPage";
import { useJobs } from "../../context/JobContext";

function JobDetailsWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { jobs, toggleJobStatus, restartJob } = useJobs();
    const job = jobs.find(j => j.id === id);

    if (!job) return <div style={{ padding: 24, color: "var(--text-muted)" }}>Job not found.</div>;
    return (
        <JobDetailsPage
            job={job}
            onBack={() => navigate("/jobs")}
            onPauseResume={() => toggleJobStatus(job.id)}
            onRestart={() => restartJob(job.id)}
        />
    );
}

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<GalleryPage />} />
                <Route path="/albums" element={<GalleryPage />} />
                <Route path="/sources" element={<SourcesPage />} />
                <Route path="/metadata" element={<MetadataPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailsWrapper />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
// Note: onOpenJob using window.location is a hack, should use navigate from hook if possible, or pass navigate.
// JobsPage needs refactor to useLink or navigate internally.
// But for now keeping compatibility.
