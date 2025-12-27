import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AlbumsSidebar } from "./AlbumsSidebar";
import { FilterModal } from "../../components/search/FilterModal";
import { usePhotos } from "../../context/PhotoContext";
import { Lightbox } from "../../components/gallery/Lightbox";

import styles from "./MainLayout.module.css";

// Map Sidebar views
const getSidebarView = (path: string) => {
    if (path.startsWith("/albums")) return "albums";
    if (path.startsWith("/sources")) return "sources";
    if (path.startsWith("/metadata")) return "metadata";
    if (path.startsWith("/jobs")) return "jobs";
    if (path.startsWith("/map")) return "map";
    return "photos";
};

export function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedAlbumSectionId, setSelectedAlbumSectionId] = useState<string | null>(null);

    const { photos, selectedPhotoId, setSelectedPhotoId, setScrollToGroupId } = usePhotos();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className={styles.layoutRoot}>
            <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onFilterClick={() => setIsFilterModalOpen(true)} />

            <div className={styles.contentWrapper}>
                <Sidebar
                    isOpen={isSidebarOpen}
                    view={getSidebarView(location.pathname)}
                    onNavigate={(view) => {
                        if (view === "photos") navigate("/");
                        else if (view === "albums") navigate("/albums");
                        else navigate("/" + view);
                    }}
                />

                {location.pathname.startsWith("/albums") && (
                    <AlbumsSidebar
                        photos={photos}
                        isMainSidebarOpen={isSidebarOpen}
                        selectedSectionId={selectedAlbumSectionId}
                        onSelectSection={(sectionId) => {
                            setSelectedAlbumSectionId(sectionId);
                            setScrollToGroupId(sectionId);
                        }}
                    />
                )}

                <main className={styles.mainContent}>
                    <div className={styles.mainInner}>
                        <Outlet />
                    </div>
                </main>
            </div>

            <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />

            {selectedPhotoId && !location.pathname.startsWith("/metadata") && photos.length > 0 && (
                <Lightbox
                    onClose={() => setSelectedPhotoId(null)}
                />
            )}
        </div>
    );
}
