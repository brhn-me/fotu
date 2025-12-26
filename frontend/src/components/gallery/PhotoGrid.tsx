import { useMemo, useEffect, useRef } from 'react';
import type { Photo } from '../../types';
import { groupPhotosByDate } from '../../utils/photoUtils';
import { useSelection } from '../../context/SelectionContext';
import { usePhotos } from '../../context/PhotoContext';
import { Check } from 'lucide-react';
import { GroupedVirtuoso, type GroupedVirtuosoHandle } from 'react-virtuoso';
import { useResizeObserver } from '../../utils/useResizeObserver';
import { computeJustifiedLayout } from '../../utils/justifiedLayout';
import styles from './PhotoGrid.module.css';

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
            className={styles.gridOuter}
        >
            {/* Only render Virtuoso if we have width determined */}
            {containerWidth > 0 && (
                <GroupedVirtuoso
                    ref={virtuosoRef}
                    className={styles.virtuoso}
                    groupCounts={groupCounts}
                    scrollerRef={(ref) => {
                        if (ref) (ref as HTMLElement).id = 'photo-grid';
                    }}
                    groupContent={(index) => {
                        const group = groups[index];
                        const photoIds = group.photos.map(p => p.id);
                        const selectionStatus = getGroupStatus(photoIds);
                        const isSelected = selectionStatus !== 'none';

                        return (
                            <div
                                className={styles.dateHeader}
                                onClick={() => toggleGroup(photoIds)}
                            >
                                <div
                                    className={`${styles.headerCheckbox} ${isSelected ? styles.headerCheckboxVisible : styles.headerCheckboxHidden}`}
                                >
                                    <Check size={12} strokeWidth={4} />
                                </div>

                                <h2 className={`${styles.dateLabel} ${isSelected ? styles.dateLabelActive : styles.dateLabelInactive}`}>
                                    {group.label}
                                </h2>
                            </div>
                        );
                    }}
                    itemContent={(rowIndex, groupIndex) => {
                        let row = groupRows[groupIndex]?.[rowIndex];

                        // Fallback logic
                        if (!row) {
                            const offset = groupStartIndices[groupIndex];
                            if (rowIndex >= offset) {
                                row = groupRows[groupIndex]?.[rowIndex - offset];
                            }
                        }

                        if (!row) return null;

                        return (
                            <div
                                className={styles.photoRow}
                                style={{
                                    gap: `${GAP}px`,
                                    paddingBottom: `${GAP}px`,
                                    height: row.height,
                                }}
                            >
                                {row.photos.map((item) => {
                                    const photo = item.photo;
                                    const selected = isSelected(photo.id);
                                    return (
                                        <div
                                            key={photo.id}
                                            onClick={() => onPhotoClick(photo)}
                                            style={{ width: item.scaledWidth }}
                                            className={`${styles.photoItemWrapper} ${selected ? styles.photoItemSelected : styles.photoItemUnselected}`}
                                        >
                                            <div className={`${styles.photoItemInner} ${selected ? styles.photoItemInnerSelected : styles.photoItemInnerUnselected}`}>
                                                <img
                                                    src={photo.thumbnailUrl}
                                                    alt={photo.title}
                                                    className={styles.photoImage}
                                                    loading="lazy"
                                                />
                                                <div
                                                    className={styles.selectionOverlay}
                                                    style={{ opacity: selected ? 1 : 0 }}
                                                />
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelection(photo.id);
                                                    }}
                                                    className={`${styles.selectionCheckbox} ${selected ? styles.selectionCheckboxSelected : styles.selectionCheckboxUnselected}`}
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
                /* Hide scrollbar for standard virtualization container if needed */
                div[data-viewport-type="element"]::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
