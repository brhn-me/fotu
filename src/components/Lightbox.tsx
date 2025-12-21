import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Photo } from '../types';
import { MetadataPanel } from './MetadataPanel';

interface LightboxProps {
    photo: Photo;
    onClose: () => void;
    onUpdatePhoto: (photo: Photo) => void;
}

export function Lightbox({ photo, onClose, onUpdatePhoto }: LightboxProps) {
    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--bg-primary)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'row',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            {/* Main Image Area */}
            <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000'
            }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <X size={24} />
                </button>

                <img
                    src={photo.url}
                    alt={photo.title}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                    }}
                />
            </div>

            {/* Sidebar */}
            <MetadataPanel photo={photo} onChange={onUpdatePhoto} />

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
