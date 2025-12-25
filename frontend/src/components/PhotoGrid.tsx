// src/components/PhotoGrid.tsx

import type { Photo } from '../types';
import { groupPhotosByDate } from '../utils/photoUtils';
import { useMemo } from 'react';
import { useSelection } from '../context/SelectionContext';
import { Check } from 'lucide-react';

interface PhotoGridProps {
    photos: Photo[];
    onPhotoClick: (photo: Photo) => void;
}

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
    const groups = useMemo(() => groupPhotosByDate(photos), [photos]);
    const { isSelected, toggleSelection, toggleGroup, getGroupStatus } = useSelection();

    return (
        <div
            id="photo-grid"
            style={{
                overflowY: 'auto',
                height: '100%',
                scrollbarWidth: 'none', // Hide default scrollbar for Firefox
            }}
        >
            {groups.map((group) => {
                const photoIds = group.photos.map(p => p.id);
                const selectionStatus = getGroupStatus(photoIds);
                const isAllSelected = selectionStatus === 'all';
                const isPartial = selectionStatus === 'partial';

                return (
                    <section key={group.id} id={group.id} style={{ marginBottom: '16px' }}>
                        {/* Date Header */}
                        <div
                            className="date-header"
                            style={{
                                padding: '12px 24px 4px 24px',
                                position: 'sticky',
                                top: 0,
                                backgroundColor: 'var(--bg-primary)',
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                height: '44px', // Slightly taller for better touch target
                            }}
                            onClick={() => toggleGroup(photoIds)}
                        >
                            {/* Header Checkbox - Positioned to align exactly with photo checkboxes (24px padding + 8px offset = 32px) */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '32px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background-color 0.2s, opacity 0.2s, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: isAllSelected || isPartial ? 1 : 0,
                                    backgroundColor: (isAllSelected || isPartial) ? '#34A853' : 'rgba(0, 0, 0, 0.1)',
                                    color: 'white',
                                    zIndex: 2,
                                    // Start centered but invisible
                                    transform: 'translateX(-50%)',
                                }}
                                className="header-checkbox"
                            >
                                <Check size={12} strokeWidth={4} />
                            </div>

                            <h2 style={{
                                fontSize: '15px',
                                fontWeight: 400,
                                color: 'var(--text-primary)',
                                margin: 0,
                                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: (isAllSelected || isPartial) ? 'translateX(26px)' : 'translateX(0)',
                            }}
                                className="date-label"
                            >
                                {group.label}
                            </h2>
                        </div>

                        {/* Photo Grid for this date group */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '2px',
                            padding: '2px 24px 8px 24px',
                        }}>
                            {group.photos.map((photo) => {
                                const selected = isSelected(photo.id);
                                return (
                                    <div
                                        key={photo.id}
                                        onClick={() => onPhotoClick(photo)}
                                        style={{
                                            aspectRatio: '1',
                                            backgroundColor: selected ? 'var(--bg-selection)' : 'var(--bg-surface)',
                                            borderRadius: '0',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            isolation: 'isolate',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'background-color 0.25s ease'
                                        }}
                                    >
                                        {/* Inner container to handle shrink effect */}
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'relative',
                                            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: selected ? 'scale(0.85)' : 'scale(1)',
                                            transformOrigin: 'center center',
                                            overflow: 'hidden',
                                            backgroundColor: 'var(--bg-placeholder)'
                                        }}>
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
                                                onMouseOver={(e) => {
                                                    if (!selected) e.currentTarget.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseOut={(e) => {
                                                    if (!selected) e.currentTarget.style.transform = 'scale(1)';
                                                }}
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
                                                <span style={{ fontSize: '13px', fontWeight: 400, color: 'white' }}>{photo.title}</span>
                                            </div>
                                            {/* Selection Gradient - Nested within scaling container to stay tied to the image */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '48px',
                                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
                                                    opacity: selected ? 1 : 0,
                                                    transition: 'opacity 0.2s',
                                                    pointerEvents: 'none',
                                                    zIndex: 4
                                                }}
                                                className="checkbox-gradient"
                                            />
                                        </div>

                                        {/* Selection Checkbox - Outside scaling container to remain fixed in size and position */}
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelection(photo.id);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',
                                                zIndex: 5,
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'background-color 0.2s, opacity 0.2s',
                                                opacity: selected ? 1 : 0,
                                                backgroundColor: selected ? '#34A853' : 'rgba(255, 255, 255, 0.3)',
                                                color: 'white',
                                            }}
                                            className="selection-checkbox"
                                        >
                                            <Check size={16} strokeWidth={selected ? 4 : 3} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                );
            })}

            <style>{`
                .date-header:hover .date-label {
                    transform: translateX(26px) !important;
                }
                .date-header:hover .header-checkbox {
                    opacity: 1 !important;
                    transition-delay: 0.1s;
                }
                div[style*="isolation: isolate"]:hover .hover-info {
                    opacity: 1 !important;
                }
                div[style*="isolation: isolate"]:hover .selection-checkbox {
                    opacity: 1 !important;
                }
                div[style*="isolation: isolate"]:hover .checkbox-gradient {
                    opacity: 1 !important;
                }
                #photo-grid::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
