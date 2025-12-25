import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";
import { GalleryPage } from "../../pages/gallery/GalleryPage";
import { SourcesPage } from "../../pages/sources/SourcesPage";
import { MetadataPage } from "../../pages/metadata/MetadataPage";
import { JobsPage } from "../../pages/jobs/JobsPage";
import { JobDetailsPage } from "../../pages/jobs/JobDetailsPage";
import { JOBS_DATA } from "../../pages/jobs/jobsData";

function JobDetailsWrapper() {
    const { id } = useParams();
    const navigate = useNavigate();
    const job = JOBS_DATA.find(j => j.id === id);

    if (!job) return <div style={{ padding: 24, color: "var(--text-muted)" }}>Job not found.</div>;
    return <JobDetailsPage job={job} onBack={() => navigate("/jobs")} onPauseResume={() => { }} onRestart={() => { }} />;
}

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<GalleryPage />} />
                <Route path="/albums" element={<GalleryPage />} />
                <Route path="/sources" element={<SourcesPage />} />
                <Route path="/metadata" element={<MetadataPage />} />
                <Route path="/jobs" element={<JobsPage onOpenJob={(id) => window.location.href = `/jobs/${id}`} />} />
                <Route path="/jobs/:id" element={<JobDetailsWrapper />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
// Note: onOpenJob using window.location is a hack, should use navigate from hook if possible, or pass navigate.
// JobsPage needs refactor to useLink or navigate internally.
// But for now keeping compatibility.
