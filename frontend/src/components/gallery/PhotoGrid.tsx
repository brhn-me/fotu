
// src/components/gallery/PhotoGrid.tsx

import type { Photo } from '../../types';
import { groupPhotosByDate } from '../../utils/photoUtils';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useSelection } from '../../context/SelectionContext';
import { usePhotos } from '../../context/PhotoContext';
import { Check } from 'lucide-react';
import { GroupedVirtuoso, type GroupedVirtuosoHandle } from 'react-virtuoso';
import { useResizeObserver } from '../../utils/useResizeObserver';

interface PhotoGridProps {
    photos: Photo[];
    onPhotoClick: (photo: Photo) => void;
}

const MIN_COLUMN_WIDTH = 200;
const GAP = 2;

export function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
    const groups = useMemo(() => groupPhotosByDate(photos), [photos]);
    const { isSelected, toggleSelection, toggleGroup, getGroupStatus } = useSelection();
    const { scrollToGroupId, setScrollToGroupId } = usePhotos();

    // Resize Observer for dynamic columns
    const { ref: containerRef, width: containerWidth } = useResizeObserver<HTMLDivElement>();
    const [numColumns, setNumColumns] = useState(3);
    const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);

    useEffect(() => {
        if (containerWidth > 0) {
            const cols = Math.floor(containerWidth / MIN_COLUMN_WIDTH);
            setNumColumns(Math.max(1, cols));
        }
    }, [containerWidth]);

    // Calculate group counts (rows per group)
    const groupCounts = useMemo(() => {
        return groups.map(group => Math.ceil(group.photos.length / numColumns));
    }, [groups, numColumns]);

    // Pre-calculate starting global item index for each group
    const groupStartIndices = useMemo(() => {
        const indices: number[] = [0];
        let current = 0;
        for (const count of groupCounts) {
            current += count;
            indices.push(current);
        }
        return indices;
    }, [groupCounts]);

    const getRowPhotos = useCallback((groupIndex: number, globalRowIndex: number) => {
        const group = groups[groupIndex];
        const groupStartRow = groupStartIndices[groupIndex];
        const relativeRowIndex = globalRowIndex - groupStartRow;

        const startIndex = relativeRowIndex * numColumns;
        const endIndex = startIndex + numColumns;
        return group.photos.slice(startIndex, endIndex);
    }, [groups, groupStartIndices, numColumns]);

    // Handle Scroll Command
    useEffect(() => {
        if (scrollToGroupId && virtuosoRef.current) {
            const groupIndex = groups.findIndex(g => g.id === scrollToGroupId);
            if (groupIndex !== -1) {
                // Determine the global item index of the first row of this group.
                // GroupedVirtuoso expects 'index' to be the ITEM index.
                const itemIndex = groupStartIndices[groupIndex];

                virtuosoRef.current.scrollToIndex({
                    index: itemIndex,
                    align: 'start',
                    offset: 0 // Optional offset
                });

                // Reset the command so it can be triggered again later
                // Timeout ensures we don't conflict with render cycle if context updates are immediate
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
                        if (ref) {
                            // Assign the ID expected by TimelineScroller
                            (ref as HTMLElement).id = 'photo-grid';
                        }
                    }}

                    // Header (Group) content
                    groupContent={(index) => {
                        const group = groups[index];
                        const photoIds = group.photos.map(p => p.id);
                        const selectionStatus = getGroupStatus(photoIds);
                        const isAllSelected = selectionStatus === 'all';
                        const isPartial = selectionStatus === 'partial';

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
                                        opacity: isAllSelected || isPartial ? 1 : 0,
                                        backgroundColor: (isAllSelected || isPartial) ? '#34A853' : 'rgba(0, 0, 0, 0.1)',
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
                                    transform: (isAllSelected || isPartial) ? 'translateX(26px)' : 'translateX(0)',
                                }}
                                    className="date-label"
                                >
                                    {group.label}
                                </h2>
                            </div>
                        );
                    }}

                    // Row (Item) content
                    itemContent={(index, groupIndex) => {
                        const rowPhotos = getRowPhotos(groupIndex, index);

                        return (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
                                gap: `${GAP}px`,
                                padding: `0 24px ${GAP}px 24px`,
                                boxSizing: 'border-box'
                            }}>
                                {rowPhotos.map((photo) => {
                                    const selected = isSelected(photo.id);
                                    return (
                                        <div
                                            key={photo.id}
                                            onClick={() => onPhotoClick(photo)}
                                            style={{
                                                aspectRatio: '1',
                                                backgroundColor: selected ? 'var(--bg-selection)' : 'var(--bg-surface)',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                overflow: 'hidden'
                                            }}
                                            className="photo-item"
                                        >
                                            {/* Scaling Container */}
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
                                            </div>

                                            {/* Checkbox */}
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelection(photo.id);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px', left: '8px', zIndex: 5,
                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    backgroundColor: selected ? '#34A853' : 'rgba(255, 255, 255, 0.3)',
                                                    color: 'white',
                                                    opacity: selected ? 1 : 0,
                                                    transition: 'opacity 0.2s, background-color 0.2s'
                                                }}
                                                className="selection-checkbox"
                                            >
                                                <Check size={16} strokeWidth={selected ? 4 : 3} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Fill empty columns if last row */}
                                {rowPhotos.length < numColumns && Array.from({ length: numColumns - rowPhotos.length }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
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

