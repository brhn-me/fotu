import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";

// Lazy load pages
const GalleryPage = React.lazy(() => import("../../pages/gallery/GalleryPage").then(module => ({ default: module.GalleryPage })));
const SourcesPage = React.lazy(() => import("../../pages/sources/SourcesPage").then(module => ({ default: module.SourcesPage })));
const MetadataPage = React.lazy(() => import("../../pages/metadata/MetadataPage").then(module => ({ default: module.MetadataPage })));
const JobsPage = React.lazy(() => import("../../pages/jobs/JobsPage").then(module => ({ default: module.JobsPage })));
// Lazy Load Settings Pages
const ImagesSettings = React.lazy(() => import("../../pages/settings/ImagesSettings").then(module => ({ default: module.ImagesSettings })));
const VideosSettings = React.lazy(() => import("../../pages/settings/VideosSettings").then(module => ({ default: module.VideosSettings })));
const RawSettings = React.lazy(() => import("../../pages/settings/RawSettings").then(module => ({ default: module.RawSettings })));
const JobsSettings = React.lazy(() => import("../../pages/settings/JobsSettings").then(module => ({ default: module.JobsSettings })));
const EncodingSettings = React.lazy(() => import("../../pages/settings/EncodingSettings").then(module => ({ default: module.EncodingSettings })));
const OrganizationSettings = React.lazy(() => import("../../pages/settings/OrganizationSettings").then(module => ({ default: module.OrganizationSettings })));
const RuntimesSettings = React.lazy(() => import("../../pages/settings/RuntimesSettings").then(module => ({ default: module.RuntimesSettings })));

const ProfilePage = React.lazy(() => import("../../pages/profile/ProfilePage").then(module => ({ default: module.ProfilePage })));
const AccountsPage = React.lazy(() => import("../../pages/accounts/AccountsPage").then(module => ({ default: module.AccountsPage })));
const MapPage = React.lazy(() => import("../../pages/map/MapPage").then(module => ({ default: module.MapPage })));

export function AppRoutes() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
            <Routes>
                <Route element={<MainLayout />}>
                    {/* ... other routes */}
                    <Route path="/" element={<GalleryPage />} />
                    <Route path="/albums" element={<GalleryPage />} />
                    <Route path="/sources" element={<SourcesPage />} />
                    <Route path="/metadata" element={<MetadataPage />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/map" element={<MapPage />} />

                    {/* Settings Routes */}
                    <Route path="/settings" element={<Navigate to="/settings/images" replace />} />
                    <Route path="/settings/images" element={<ImagesSettings />} />
                    <Route path="/settings/videos" element={<VideosSettings />} />
                    <Route path="/settings/raw" element={<RawSettings />} />
                    <Route path="/settings/jobs" element={<JobsSettings />} />
                    <Route path="/settings/encoding" element={<EncodingSettings />} />
                    <Route path="/settings/organization" element={<OrganizationSettings />} />
                    <Route path="/settings/runtimes" element={<RuntimesSettings />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

