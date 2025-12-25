// src/App.tsx

import React, { useEffect, useState } from "react";
import { generateDummyPhotos } from "./services/photoService";
import type { Photo } from "./types";
import { PhotoGrid } from "./components/PhotoGrid";
import { TimelineScroller } from "./components/TimelineScroller";
import { Lightbox } from "./components/Lightbox";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { SelectionProvider } from "./context/SelectionContext";
import { Sidebar } from "./components/Sidebar";
import { JobsPage } from "./components/JobsPage";
import { JobDetailsPage } from "./components/JobDetailsPage";
import { AlbumsSidebar } from "./components/AlbumsSidebar";
import { SourcesPage } from "./components/SourcesPage";
import { MetadataPage } from "./components/MetadataPage";
import { Moon, Sun, Settings, Activity, Menu, Search, SlidersHorizontal, X, User, LogOut } from "lucide-react";
import { JOBS_DATA } from "./components/jobsData";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--text-primary)",
        cursor: "pointer",
        padding: "8px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

const PinwheelLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C12 8.68629 9.31371 6 6 6C2.68629 6 0 8.68629 0 12C0 12 0 12 0 12H12Z" fill="#4285F4" transform="translate(12, 0)" />
    <path d="M12 12C15.3137 12 18 9.31371 18 6C18 2.68629 15.3137 0 12 0C12 0 12 0 12 0V12Z" fill="#EA4335" transform="translate(0, 0)" />
    <path d="M12 12C12 15.3137 14.6863 18 18 18C21.3137 18 24 15.3137 24 12C24 12 24 12 24 12H12Z" fill="#FBBC05" transform="translate(-12, 0)" />
    <path d="M12 12C8.68629 12 6 14.6863 6 18C6 21.3137 8.68629 24 12 24C12 24 12 24 12 24V12Z" fill="#34A853" transform="translate(0, -12)" />
  </svg>
);

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#34A853", color: "white", border: "2px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600, marginLeft: "4px", transition: "all 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
      >
        B
      </button>
      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1999 }} />
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: "280px", backgroundColor: "var(--bg-primary)", borderRadius: "16px", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-subtle)", padding: "16px 0", zIndex: 2000, animation: "fadeInScale 0.15s ease-out" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px 20px 20px 20px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "8px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundImage: "url(/profile.jpg)", backgroundSize: "cover", backgroundPosition: "center", marginBottom: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Burhan</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>burhan@example.com</div>
              <button style={{ marginTop: "16px", padding: "8px 24px", borderRadius: "20px", border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-primary)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>Manage your Account</button>
            </div>
            <div style={{ padding: "4px 0" }}>
              <button style={{ width: "100%", padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "14px", textAlign: "left", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}><User size={18} />Profile</button>
              <button style={{ width: "100%", padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "14px", textAlign: "left", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}><Settings size={18} />Settings</button>
              <button style={{ width: "100%", padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "14px", textAlign: "left", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}><LogOut size={18} />Logout</button>
            </div>
            <style>{`@keyframes fadeInScale { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
          </div>
        </>
      )}
    </div>
  );
};

const FilterModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "500px", backgroundColor: "var(--bg-primary)", borderRadius: "24px", padding: "24px", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 500, color: "var(--text-primary)" }}>Search filters</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Favorites", "Videos", "Selfies", "Screenshots", "Archives"].map(cat => <button key={cat} style={{ padding: "8px 16px", borderRadius: "18px", border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-primary)" }}>{cat}</button>)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "40px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", background: "transparent", border: "none", color: "var(--accent-primary)" }}>Reset</button>
          <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: "20px", border: "none", background: "var(--accent-primary)", color: "white" }}>Apply filters</button>
        </div>
      </div>
    </div>
  );
}

const SearchBar = ({ onFilterClick }: { onFilterClick: () => void }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ flex: 1, maxWidth: "720px", margin: "0 24px", position: "relative", display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: "16px", color: isFocused ? "var(--accent-primary)" : "var(--text-secondary)", display: "flex", alignItems: "center", pointerEvents: "none" }}><Search size={18} /></div>
      <input type="text" placeholder="Search photos..." onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} style={{ width: "100%", height: "48px", backgroundColor: isFocused ? "var(--bg-primary)" : "var(--bg-secondary)", border: isFocused ? "1px solid var(--accent-primary)" : "1px solid transparent", borderRadius: "24px", padding: "0 52px 0 52px", fontSize: "15px", color: "var(--text-primary)", outline: "none", transition: "all 0.2s ease", boxShadow: isFocused ? "var(--shadow-md)" : "none" }} />
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFilterClick(); }} style={{ position: "absolute", right: "12px", background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} title="Search filters"><SlidersHorizontal size={18} /></button>
    </div>
  );
};

const HeaderAction = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} title={label}>
    {icon}
  </button>
);

const Header = ({ onMenuClick, onFilterClick }: { onMenuClick: () => void; onFilterClick: () => void; }) => {
  const navigate = useNavigate();
  return (
    <header style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)", position: "sticky", top: 0, zIndex: 1100 }}>
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <button onClick={onMenuClick} style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px" }}><Menu size={20} /></button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px" }}><PinwheelLogo /></div>
        <h1 style={{ fontSize: "18px", fontWeight: 400, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Photika</h1>
      </div>
      <SearchBar onFilterClick={onFilterClick} />
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <div onClick={() => navigate("/jobs")}><HeaderAction icon={<Activity size={20} />} label="Jobs" /></div>
        <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border-subtle)", margin: "0 8px" }} />
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
};

function JobDetailsWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = JOBS_DATA.find(j => j.id === id);

  if (!job) return <div style={{ padding: 24, color: "var(--text-muted)" }}>Job not found.</div>;
  return <JobDetailsPage job={job} onBack={() => navigate("/jobs")} onPauseResume={() => { }} onRestart={() => { }} />;
}

// Map Sidebar views
const getSidebarView = (path: string) => {
  if (path.startsWith("/albums")) return "albums";
  if (path.startsWith("/sources")) return "sources";
  if (path.startsWith("/metadata")) return "metadata";
  if (path.startsWith("/jobs")) return "jobs";
  return "photos";
};

function MainLayout() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedAlbumSectionId, setSelectedAlbumSectionId] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const data = generateDummyPhotos();
    setPhotos(data);
  }, []);

  const handleUpdatePhoto = (updatedPhoto: Photo) => {
    setPhotos((prev) => prev.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p)));
  };

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
            <Routes>
              <Route path="/" element={<><PhotoGrid photos={photos} onPhotoClick={(p) => setSelectedPhotoId(p.id)} /><TimelineScroller photos={photos} /></>} />
              <Route path="/albums" element={<><PhotoGrid photos={photos} onPhotoClick={(p) => setSelectedPhotoId(p.id)} /><TimelineScroller photos={photos} /></>} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="/metadata" element={<MetadataPage photos={photos} selectedPhotoId={selectedPhotoId} onSelectPhoto={(id) => setSelectedPhotoId(id)} onUpdatePhoto={handleUpdatePhoto} />} />
              <Route path="/jobs" element={<JobsPage onOpenJob={(id) => navigate(`/jobs/${id}`)} />} />
              <Route path="/jobs/:id" element={<JobDetailsWrapper />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />

      {selectedPhotoId && !location.pathname.startsWith("/metadata") && (
        <Lightbox
          photo={photos.find(p => p.id === selectedPhotoId)!}
          onClose={() => setSelectedPhotoId(null)}
          onUpdatePhoto={handleUpdatePhoto}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SelectionProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </SelectionProvider>
    </ThemeProvider>
  );
}
