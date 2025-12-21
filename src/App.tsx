import { useEffect, useState } from 'react';
import { generateDummyPhotos } from './services/photoService';
import type { Photo } from './types';
import { PhotoGrid } from './components/PhotoGrid';
import { TimelineScroller } from './components/TimelineScroller';
import { Lightbox } from './components/Lightbox';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SelectionProvider } from './context/SelectionContext';
import { Sidebar } from './components/Sidebar';
import { Moon, Sun, Settings, Activity, Menu, Search, SlidersHorizontal, X } from 'lucide-react';
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


const FilterModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '500px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 500, color: 'var(--text-primary)' }}>Search filters</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categories</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {['Favorites', 'Videos', 'Selfies', 'Screenshots', 'Archives'].map(cat => (
                <button key={cat} style={{ padding: '8px 16px', borderRadius: '18px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '14px' }}>{cat}</button>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {['Any time', 'Last 7 days', 'Last 30 days', 'Specific range'].map(time => (
                <button key={time} style={{ padding: '8px 16px', borderRadius: '18px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '14px' }}>{time}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '40px' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: 'transparent', color: 'var(--accent-primary)', fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: '20px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 500, cursor: 'pointer' }}>Apply filters</button>
        </div>
      </div>
    </div>
  );
};

const SearchBar = ({ onFilterClick }: { onFilterClick: () => void }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{
      flex: 1,
      maxWidth: '720px',
      margin: '0 24px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        position: 'absolute',
        left: '16px',
        color: isFocused ? 'var(--accent-primary)' : 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.2s',
        pointerEvents: 'none'
      }}>
        <Search size={18} />
      </div>
      <input
        type="text"
        placeholder="Search photos..."
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          height: '48px',
          backgroundColor: isFocused ? 'var(--bg-primary)' : 'var(--bg-secondary)',
          border: isFocused ? '1px solid var(--accent-primary)' : '1px solid transparent',
          borderRadius: '24px',
          padding: '0 52px 0 52px',
          fontSize: '15px',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: isFocused ? 'var(--shadow-md)' : 'none',
        }}
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFilterClick();
        }}
        style={{
          position: 'absolute',
          right: '12px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Search filters"
      >
        <SlidersHorizontal size={18} />
      </button>
    </div>
  );
};

const Header = ({ onMenuClick, onFilterClick }: { onMenuClick: () => void, onFilterClick: () => void }) => (
  <header style={{
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottom: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-primary)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  }}>
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <button
        onClick={onMenuClick}
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
          marginRight: '8px'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Menu size={20} />
      </button>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '8px'
      }}>
        <PinwheelLogo />
      </div>
      <h1 style={{
        fontSize: '18px',
        fontWeight: 400,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em'
      }}>
        Photika
      </h1>
    </div>

    <SearchBar onFilterClick={onFilterClick} />

    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      <Header
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onFilterClick={() => setIsFilterModalOpen(true)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar isOpen={isSidebarOpen} />

        <main style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          minWidth: 0
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
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhotoId(null)}
          onUpdatePhoto={handleUpdatePhoto}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SelectionProvider>
        <AppContent />
      </SelectionProvider>
    </ThemeProvider>
  );
}

export default App;
