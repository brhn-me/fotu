import type { Photo } from '../types';
import { groupPhotosByDate } from '../utils/photoUtils';
import { useMemo } from 'react';

interface PhotoGridProps {
    photos: Photo[];
    onPhotoClick: (photo: Photo) => void;
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
    const groups = useMemo(() => groupPhotosByDate(photos), [photos]);

    return (
        <div
            id="photo-grid"
            style={{
                overflowY: 'auto',
                height: '100%',
                scrollbarWidth: 'none', // Hide default scrollbar for Firefox
            }}
        >
            {groups.map((group) => (
                <section key={group.id} id={group.id} style={{ marginBottom: '48px' }}>
                    {/* Date Header */}
                    <div style={{
                        padding: '24px 24px 16px 24px',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'var(--bg-primary)',
                        zIndex: 10,
                        borderBottom: '1px solid var(--border-subtle)',
                    }}>
                        <h2 style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            margin: 0,
                        }}>
                            {group.label}
                        </h2>
                        <p style={{
                            fontSize: '13px',
                            color: 'var(--text-muted)',
                            margin: '4px 0 0 0',
                        }}>
                            {group.photos.length} {group.photos.length === 1 ? 'photo' : 'photos'}
                        </p>
                    </div>

                    {/* Photo Grid for this date group */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '16px',
                        padding: '24px',
                    }}>
                        {group.photos.map((photo) => (
                            <div
                                key={photo.id}
                                onClick={() => onPhotoClick(photo)}
                                style={{
                                    aspectRatio: '1',
                                    backgroundColor: 'var(--bg-surface)',
                                    borderRadius: 'var(--radius-sm)',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    isolation: 'isolate'
                                }}
                            >
                                <img
                                    src={photo.thumbnailUrl}
                                    alt={photo.title}
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform var(--transition-smooth)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '8px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    opacity: 0,
                                    transition: 'opacity var(--transition-fast)',
                                    pointerEvents: 'none'
                                }}
                                    className="hover-info"
                                >
                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{photo.title}</span>
                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                                        {new Date(photo.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            <style>{`
                div[style*="isolation: isolate"]:hover .hover-info {
                    opacity: 1 !important;
                }
                #photo-grid::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
