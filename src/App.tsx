import { useEffect, useState } from 'react';
import { generateDummyPhotos } from './services/photoService';
import type { Photo } from './types';
import { PhotoGrid } from './components/PhotoGrid';
import { TimelineScroller } from './components/TimelineScroller';
import { Lightbox } from './components/Lightbox';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

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
const Header = () => (
  <header style={{
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    borderBottom: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-secondary)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  }}>
    <h1 style={{ fontSize: '20px', fontWeight: 600 }}>Photos</h1>
    <ThemeToggle />
  </header>
);

function AppContent() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  useEffect(() => {
    const data = generateDummyPhotos(50);
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
