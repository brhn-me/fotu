import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";

// Lazy load pages
const GalleryPage = React.lazy(() => import("../../pages/gallery/GalleryPage").then(module => ({ default: module.GalleryPage })));
const SourcesPage = React.lazy(() => import("../../pages/sources/SourcesPage").then(module => ({ default: module.SourcesPage })));
const MetadataPage = React.lazy(() => import("../../pages/metadata/MetadataPage").then(module => ({ default: module.MetadataPage })));
const JobsPage = React.lazy(() => import("../../pages/jobs/JobsPage").then(module => ({ default: module.JobsPage })));
// Lazy Load Settings Pages
const ThumbnailsSettings = React.lazy(() => import("../../pages/settings/ThumbnailsSettings").then(module => ({ default: module.ThumbnailsSettings })));
const LightboxSettings = React.lazy(() => import("../../pages/settings/LightboxSettings").then(module => ({ default: module.LightboxSettings })));
const RawSettings = React.lazy(() => import("../../pages/settings/RawSettings").then(module => ({ default: module.RawSettings })));
const JobsSettings = React.lazy(() => import("../../pages/settings/JobsSettings").then(module => ({ default: module.JobsSettings })));
const EncodingSettings = React.lazy(() => import("../../pages/settings/EncodingSettings").then(module => ({ default: module.EncodingSettings })));
const OrganizationSettings = React.lazy(() => import("../../pages/settings/OrganizationSettings").then(module => ({ default: module.OrganizationSettings })));
const RuntimesSettings = React.lazy(() => import("../../pages/settings/RuntimesSettings").then(module => ({ default: module.RuntimesSettings })));

const ProfilePage = React.lazy(() => import("../../pages/profile/ProfilePage").then(module => ({ default: module.ProfilePage })));
const AccountsPage = React.lazy(() => import("../../pages/accounts/AccountsPage").then(module => ({ default: module.AccountsPage })));
const MapPage = React.lazy(() => import("../../pages/map/MapPage").then(module => ({ default: module.MapPage })));
const FilesPage = React.lazy(() => import("../../pages/files/FilesPage").then(module => ({ default: module.FilesPage })));

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
                    <Route path="/files" element={<FilesPage />} />

                    {/* Settings Routes */}
                    <Route path="/settings" element={<Navigate to="/settings/thumbnails" replace />} />
                    <Route path="/settings/thumbnails" element={<ThumbnailsSettings />} />
                    <Route path="/settings/lightbox" element={<LightboxSettings />} />
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

