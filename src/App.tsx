import { useEffect, useState } from 'react';
import { generateDummyPhotos } from './services/photoService';
import type { Photo } from './types';
import { PhotoGrid } from './components/PhotoGrid';
import { TimelineScroller } from './components/TimelineScroller';
import { Lightbox } from './components/Lightbox';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Moon, Sun, Database, Settings, Activity } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

// Placeholder components
const PinwheelLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C12 8.68629 9.31371 6 6 6C2.68629 6 0 8.68629 0 12C0 12 0 12 0 12H12Z" fill="#4285F4" transform="translate(12, 0)" />
    <path d="M12 12C15.3137 12 18 9.31371 18 6C18 2.68629 15.3137 0 12 0C12 0 12 0 12 0V12Z" fill="#EA4335" transform="translate(0, 0)" />
    <path d="M12 12C12 15.3137 14.6863 18 18 18C21.3137 18 24 15.3137 24 12C24 12 24 12 24 12H12Z" fill="#FBBC05" transform="translate(-12, 0)" />
    <path d="M12 12C8.68629 12 6 14.6863 6 18C6 21.3137 8.68629 24 12 24C12 24 12 24 12 24V12Z" fill="#34A853" transform="translate(0, -12)" />
  </svg>
);

const Header = () => (
  <header style={{
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    borderBottom: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-primary)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <PinwheelLogo />
      </div>
      <h1 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em'
      }}>
        Photo Organizer
      </h1>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <HeaderAction icon={<Database size={20} />} label="Sources" />
      <HeaderAction icon={<Activity size={20} />} label="Jobs" />
      <HeaderAction icon={<Settings size={20} />} label="Settings" />
      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)', margin: '0 8px' }} />
      <ThemeToggle />
    </div>
  </header>
);

const HeaderAction = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button
    style={{
      background: 'transparent',
      border: 'none',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      position: 'relative'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
      e.currentTarget.style.color = 'var(--text-primary)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = 'var(--text-secondary)';
    }}
    title={label}
  >
    {icon}
  </button>
);

function AppContent() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  useEffect(() => {
    const data = generateDummyPhotos();
    setPhotos(data);
  }, []);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhotoId(photo.id);
  };

  const handleUpdatePhoto = (updatedPhoto: Photo) => {
    setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
  };

  const selectedPhoto = photos.find(p => p.id === selectedPhotoId);

  return (
    <>
      <Header />
      <main style={{
        flex: 1,
        position: 'relative',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}>
          <PhotoGrid photos={photos} onPhotoClick={handlePhotoClick} />
        </div>
        <TimelineScroller photos={photos} />
      </main>

      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhotoId(null)}
          onUpdatePhoto={handleUpdatePhoto}
        />
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
