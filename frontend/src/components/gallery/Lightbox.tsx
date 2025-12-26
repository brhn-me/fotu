// src/components/gallery/Lightbox.tsx

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Info, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { usePhotos } from '../../context/PhotoContext';
import { MetadataPanel } from '../metadata/MetadataPanel';
import styles from './Lightbox.module.css';

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
        <div className={styles.overlay}>
            {/* Main Image Area */}
            <div
                className={`${styles.mainArea} ${zoom > 1 ? (isDragging ? styles.dragging : styles.draggable) : ''}`}
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
                <div className={styles.headerControls}>
                    {canZoom && (
                        <button onClick={toggleZoom} className={styles.lightboxBtn} title={zoom > 1 ? "Zoom Out" : "Zoom In"}>
                            {zoom > 1 ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                        </button>
                    )}
                    <button onClick={handleDownload} className={styles.lightboxBtn} title="Download (Shift+D)">
                        <Download size={20} />
                    </button>
                    <button onClick={() => setIsInfoOpen(!isInfoOpen)} className={styles.lightboxBtn} title="Info">
                        <Info size={20} />
                    </button>
                    <button onClick={handleDelete} className={styles.lightboxBtn} title="Delete">
                        <Trash2 size={20} />
                    </button>
                    <button onClick={onClose} className={styles.lightboxBtn} title="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Buttons */}
                {currentPhotoIndex > 0 && !isDragging && (
                    <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className={`${styles.navBtn} ${styles.prevBtn}`}>
                        <ChevronLeft size={32} />
                    </button>
                )}
                {currentPhotoIndex < photos.length - 1 && !isDragging && (
                    <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className={`${styles.navBtn} ${styles.nextBtn}`}>
                        <ChevronRight size={32} />
                    </button>
                )}

                <img
                    ref={imgRef}
                    src={photo.url}
                    alt={photo.title}
                    onLoad={handleImageLoad}
                    draggable={false}
                    className={styles.image}
                    style={{
                        transition: isDragging ? 'none' : 'transform 0.2s',
                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    }}
                />
            </div>

            {/* Slide-out Sidebar */}
            <div className={`${styles.sidebar} ${isInfoOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
                <div className={styles.sidebarContent}>
                    <MetadataPanel photo={photo} onChange={updatePhoto} />
                </div>
            </div>
        </div>
    );
}
