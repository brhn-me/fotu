import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layout/MainLayout";

// Lazy load pages
const GalleryPage = React.lazy(() => import("../../pages/gallery/GalleryPage").then(module => ({ default: module.GalleryPage })));
const SourcesPage = React.lazy(() => import("../../pages/sources/SourcesPage").then(module => ({ default: module.SourcesPage })));
const MetadataPage = React.lazy(() => import("../../pages/metadata/MetadataPage").then(module => ({ default: module.MetadataPage })));
const JobsPage = React.lazy(() => import("../../pages/jobs/JobsPage").then(module => ({ default: module.JobsPage })));
const JobConcurrencyPage = React.lazy(() => import("../../pages/jobs/JobConcurrencyPage").then(module => ({ default: module.JobConcurrencyPage })));
const SettingsPage = React.lazy(() => import("../../pages/settings/SettingsPage").then(module => ({ default: module.SettingsPage })));
const ProfilePage = React.lazy(() => import("../../pages/profile/ProfilePage").then(module => ({ default: module.ProfilePage })));
const AccountsPage = React.lazy(() => import("../../pages/accounts/AccountsPage").then(module => ({ default: module.AccountsPage })));
const MapPage = React.lazy(() => import("../../pages/map/MapPage").then(module => ({ default: module.MapPage })));

export function AppRoutes() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<GalleryPage />} />
                    <Route path="/albums" element={<GalleryPage />} />
                    <Route path="/sources" element={<SourcesPage />} />
                    <Route path="/metadata" element={<MetadataPage />} />

                    {/* Jobs Routes */}
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/jobs/concurrency" element={<JobConcurrencyPage />} />

                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

