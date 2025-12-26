// src/components/gallery/Lightbox.tsx

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Info, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { usePhotos } from '../../context/PhotoContext';
import { MetadataPanel } from '../metadata/MetadataPanel';

interface LightboxProps {
    onClose: () => void;
}

export function Lightbox({ onClose }: LightboxProps) {
    const { photos, selectedPhotoId, setSelectedPhotoId, updatePhoto } = usePhotos();
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    // Zoom and Pan state
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Image Dimensions for smart zoom
    const imgRef = useRef<HTMLImageElement>(null);
    const [canZoom, setCanZoom] = useState(false);
    const [maxZoom, setMaxZoom] = useState(1);

    const currentPhotoIndex = photos.findIndex(p => p.id === selectedPhotoId);
    const photo = photos[currentPhotoIndex];

    // Reset zoom/pan when photo changes
    useEffect(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setCanZoom(false);
        setMaxZoom(1);
    }, [selectedPhotoId]);

    const handleNext = useCallback(() => {
        if (currentPhotoIndex < photos.length - 1) {
            setSelectedPhotoId(photos[currentPhotoIndex + 1].id);
        }
    }, [currentPhotoIndex, photos, setSelectedPhotoId]);

    const handlePrev = useCallback(() => {
        if (currentPhotoIndex > 0) {
            setSelectedPhotoId(photos[currentPhotoIndex - 1].id);
        }
    }, [currentPhotoIndex, photos, setSelectedPhotoId]);

    const handleDelete = () => {
        console.log("Delete photo", photo.id);
        alert("Delete functionality to be implemented");
    };

    const handleDownload = async () => {
        if (!photo) return;
        try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `photo-${photo.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download failed, falling back to link", e);
            const link = document.createElement('a');
            link.href = photo.url;
            link.download = `photo-${photo.id}.jpg`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleImageLoad = () => {
        if (imgRef.current) {
            const { naturalWidth, width } = imgRef.current;
            if (naturalWidth > width) {
                setCanZoom(true);
                // Calculate zoom needed to reach 1:1
                // Standard max zoom can be this ratio, or capped at something reasonable if huge
                setMaxZoom(naturalWidth / width);
            } else {
                setCanZoom(false);
            }
        }
    };

    const toggleZoom = () => {
        if (zoom > 1) {
            setZoom(1);
            setPan({ x: 0, y: 0 }); // Reset pan
        } else {
            // Zoom to actual size (maxZoom)
            setZoom(maxZoom);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
                e.preventDefault();
                handleDownload();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onClose, photo]);

    // Mouse handlers for panning
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
            e.preventDefault(); // Stop text selection etc
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPan({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    if (!photo) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--bg-primary)',
            zIndex: 2000,
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
                background: '#000',
                overflow: 'hidden',
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
                onClick={(e) => {
                    // Close only if clicking the background (container), not the image
                    if (e.target === e.currentTarget) onClose();
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Header Controls */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    gap: '12px',
                    zIndex: 20
                }}>
                    {canZoom && (
                        <button onClick={toggleZoom} className="lightbox-btn" title={zoom > 1 ? "Zoom Out" : "Zoom In"}>
                            {zoom > 1 ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                        </button>
                    )}
                    <button onClick={handleDownload} className="lightbox-btn" title="Download (Shift+D)">
                        <Download size={20} />
                    </button>
                    {/* Removed Separator */}
                    <button onClick={() => setIsInfoOpen(!isInfoOpen)} className="lightbox-btn" title="Info">
                        <Info size={20} />
                    </button>
                    <button onClick={handleDelete} className="lightbox-btn" title="Delete">
                        <Trash2 size={20} />
                    </button>
                    <button onClick={onClose} className="lightbox-btn" title="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Buttons */}
                {currentPhotoIndex > 0 && !isDragging && (
                    <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="nav-btn prev">
                        <ChevronLeft size={32} />
                    </button>
                )}
                {currentPhotoIndex < photos.length - 1 && !isDragging && (
                    <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="nav-btn next">
                        <ChevronRight size={32} />
                    </button>
                )}

                <img
                    ref={imgRef}
                    src={photo.url}
                    alt={photo.title}
                    onLoad={handleImageLoad}
                    draggable={false}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transition: isDragging ? 'none' : 'transform 0.2s',
                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        // Removed pointerEvents: 'none' to allow drag on image
                        userSelect: 'none'
                    }}
                />
            </div>

            {/* Slide-out Sidebar */}
            <div style={{
                width: isInfoOpen ? '360px' : '0px',
                overflow: 'hidden',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderLeft: isInfoOpen ? '1px solid var(--border-subtle)' : 'none',
                backgroundColor: 'var(--bg-surface)'
            }}>
                <div style={{ width: '360px', height: '100%' }}>
                    <MetadataPanel photo={photo} onChange={updatePhoto} />
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .lightbox-btn {
                    background: rgba(0,0,0,0.5);
                    border: none;
                    color: white;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .lightbox-btn:hover { background: rgba(0,0,0,0.7); }
                
                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    padding: 20px;
                    transition: color 0.2s, transform 0.2s;
                    z-index: 10;
                }
                .nav-btn:hover { color: white; transform: translateY(-50%) scale(1.1); }
                .nav-btn.prev { left: 10px; }
                .nav-btn.next { right: 10px; }
            `}</style>
        </div>
    );
}
