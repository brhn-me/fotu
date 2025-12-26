import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";
import { GalleryPage } from "../../pages/gallery/GalleryPage";
import { SourcesPage } from "../../pages/sources/SourcesPage";
import { MetadataPage } from "../../pages/metadata/MetadataPage";
import { JobsPage } from "../../pages/jobs/JobsPage";
import { JobDetailsPage } from "../../pages/jobs/JobDetailsPage";
import { JobConcurrencyPage } from "../../pages/jobs/JobConcurrencyPage";
import { SettingsPage } from "../../pages/settings/SettingsPage";
import { ProfilePage } from "../../pages/profile/ProfilePage";
import { AccountsPage } from "../../pages/accounts/AccountsPage";
import { MapPage } from "../../pages/map/MapPage";
import { useJobs } from "../../context/JobContext";

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<GalleryPage />} />
                <Route path="/albums" element={<GalleryPage />} />
                <Route path="/sources" element={<SourcesPage />} />
                <Route path="/metadata" element={<MetadataPage />} />

                {/* Jobs Routes */}
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/concurrency" element={<JobConcurrencyPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />

                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

