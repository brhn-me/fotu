import { useMemo, useEffect, useRef } from 'react';
import type { Photo } from '../../types';
import { groupPhotosByDate } from '../../utils/photoUtils';
import { useSelection } from '../../context/SelectionContext';
import { usePhotos } from '../../context/PhotoContext';
import { Check } from 'lucide-react';
import { GroupedVirtuoso, type GroupedVirtuosoHandle } from 'react-virtuoso';
import { useResizeObserver } from '../../utils/useResizeObserver';
import { computeJustifiedLayout } from '../../utils/justifiedLayout';

interface PhotoGridProps {
    photos: Photo[];
    onPhotoClick: (photo: Photo) => void;
}

const GAP = 2;

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
    const groups = useMemo(() => groupPhotosByDate(photos), [photos]);
    const { isSelected, toggleSelection, toggleGroup, getGroupStatus } = useSelection();
    const { scrollToGroupId, setScrollToGroupId } = usePhotos();

    // Resize Observer for dynamic columns
    const { ref: containerRef, width: containerWidth } = useResizeObserver<HTMLDivElement>();
    const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);

    // Justified Layout Calculation
    // We compute the rows for each group
    const groupRows = useMemo(() => {
        return groups.map(group => {
            return computeJustifiedLayout(
                group.photos,
                containerWidth - 48, // Subtract padding (24px left + 24px right)
                220 // Target row height
            );
        });
    }, [groups, containerWidth]);

    // Calculate group counts (number of rows per group)
    const groupCounts = useMemo(() => {
        return groupRows.map(rows => rows.length);
    }, [groupRows]);

    // Pre-calculate starting global item index for each group (needed for scrolling)
    const groupStartIndices = useMemo(() => {
        const indices: number[] = [0];
        let current = 0;
        for (const count of groupCounts) {
            current += count;
            indices.push(current);
        }
        return indices;
    }, [groupCounts]);

    // Handle Scroll Command
    useEffect(() => {
        if (scrollToGroupId && virtuosoRef.current) {
            const groupIndex = groups.findIndex(g => g.id === scrollToGroupId);
            if (groupIndex !== -1) {
                const itemIndex = groupStartIndices[groupIndex];
                virtuosoRef.current.scrollToIndex({
                    index: itemIndex,
                    align: 'start',
                    offset: 0,
                    behavior: 'smooth'
                });
                setTimeout(() => setScrollToGroupId(null), 100);
            }
        }
    }, [scrollToGroupId, groups, groupStartIndices, setScrollToGroupId]);

    return (
        <div
            ref={containerRef}
            id="photo-grid-outer"
            style={{
                height: '100%',
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                position: 'relative',
                zIndex: 0
            }}
        >
            {/* Only render Virtuoso if we have width determined */}
            {containerWidth > 0 && (
                <GroupedVirtuoso
                    ref={virtuosoRef}
                    style={{ height: '100%', width: '100%' }}
                    groupCounts={groupCounts}
                    scrollerRef={(ref) => {
                        if (ref) (ref as HTMLElement).id = 'photo-grid';
                    }}
                    groupContent={(index) => {
                        const group = groups[index];
                        const photoIds = group.photos.map(p => p.id);
                        const selectionStatus = getGroupStatus(photoIds);
                        // ... header rendering remains largely same but updated for context ...
                        return (
                            <div
                                className="date-header"
                                style={{
                                    padding: '12px 24px 4px 24px',
                                    backgroundColor: 'var(--bg-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    height: '44px',
                                }}
                                onClick={() => toggleGroup(photoIds)}
                            >
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
                                        opacity: selectionStatus !== 'none' ? 1 : 0,
                                        backgroundColor: selectionStatus !== 'none' ? '#34A853' : 'rgba(0, 0, 0, 0.1)',
                                        color: 'white',
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
                                    transform: selectionStatus !== 'none' ? 'translateX(26px)' : 'translateX(0)',
                                }}
                                    className="date-label"
                                >
                                    {group.label}
                                </h2>
                            </div>
                        );
                    }}
                    itemContent={(rowIndex, groupIndex) => {
                        let row = groupRows[groupIndex]?.[rowIndex];

                        // Fallback: If row is undefined, it might be that indexes are global (though they shouldn't be in v4).
                        // Or we messed up something else. But handling global index is safe if it exceeds length.
                        if (!row) {
                            const offset = groupStartIndices[groupIndex];
                            if (rowIndex >= offset) {
                                row = groupRows[groupIndex]?.[rowIndex - offset];
                            }
                        }

                        if (!row) return null;

                        return (
                            <div style={{
                                display: 'flex',
                                gap: `${GAP}px`,
                                padding: `0 24px ${GAP}px 24px`,
                                height: row.height, // Explicit height
                                boxSizing: 'content-box' // Important for padding
                            }}>
                                {row.photos.map((item) => {
                                    const photo = item.photo;
                                    const selected = isSelected(photo.id);
                                    return (
                                        <div
                                            key={photo.id}
                                            onClick={() => onPhotoClick(photo)}
                                            style={{
                                                width: item.scaledWidth,
                                                height: '100%',
                                                backgroundColor: selected ? 'var(--bg-selection)' : 'var(--bg-surface)',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                overflow: 'hidden'
                                            }}
                                            className="photo-item"
                                        >
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                transition: 'transform 0.2s',
                                                transform: selected ? 'scale(0.85)' : 'scale(1)',
                                                backgroundColor: 'var(--bg-placeholder)'
                                            }}>
                                                <img
                                                    src={photo.thumbnailUrl}
                                                    alt={photo.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    loading="lazy"
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
                                                    opacity: selected ? 1 : 0,
                                                    transition: 'opacity 0.2s',
                                                }} />
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelection(photo.id);
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '6px', left: '6px', zIndex: 10,
                                                        width: '18px', height: '18px', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        backgroundColor: selected ? '#34A853' : 'rgba(255, 255, 255, 0.4)',
                                                        color: 'white',
                                                        opacity: selected ? 1 : 0,
                                                        transition: 'opacity 0.2s, background-color 0.2s, transform 0.2s',
                                                        transform: selected ? 'scale(1.18)' : 'scale(1)'
                                                    }}
                                                    className="selection-checkbox"
                                                >
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    }}
                />
            )}

            <style>{`
                    .date-header:hover .date-label {
                        transform: translateX(26px) !important;
                    }
                    .date-header:hover .header-checkbox {
                        opacity: 1 !important;
                    }
                    .photo-item:hover .selection-checkbox {
                        opacity: 1 !important;
                    }
                    /* Hide scrollbar for standard virtualization container if needed */
                    div[data-viewport-type="element"]::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
        </div>
    );
}
