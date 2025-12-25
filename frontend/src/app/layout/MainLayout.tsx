import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { AlbumsSidebar } from "./AlbumsSidebar";
import { FilterModal } from "../../components/search/FilterModal";
import { usePhotos } from "../../context/PhotoContext";
import { Lightbox } from "../../components/gallery/Lightbox";

// Map Sidebar views
const getSidebarView = (path: string) => {
    if (path.startsWith("/albums")) return "albums";
    if (path.startsWith("/sources")) return "sources";
    if (path.startsWith("/metadata")) return "metadata";
    if (path.startsWith("/jobs")) return "jobs";
    return "photos";
};

export function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedAlbumSectionId, setSelectedAlbumSectionId] = useState<string | null>(null);

    const { photos, selectedPhotoId, setSelectedPhotoId, updatePhoto } = usePhotos();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "var(--bg-primary)" }}>
            <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onFilterClick={() => setIsFilterModalOpen(true)} />

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
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
                            const el = document.getElementById(sectionId);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                    />
                )}

                <main style={{ flex: 1, position: "relative", overflow: "hidden", minWidth: 0 }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                        <Outlet />
                    </div>
                </main>
            </div>

            <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />

            {selectedPhotoId && !location.pathname.startsWith("/metadata") && photos.length > 0 && (
                <Lightbox
                    photo={photos.find((p) => p.id === selectedPhotoId)!}
                    onClose={() => setSelectedPhotoId(null)}
                    onUpdatePhoto={updatePhoto}
                />
            )}
        </div>
    );
}
