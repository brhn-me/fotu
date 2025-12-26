import type { Photo } from '../../types';
import { groupPhotosByDate, groupPhotosByYearMonth } from '../../utils/photoUtils';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { usePhotos } from '../../context/PhotoContext';
import styles from './TimelineScroller.module.css';

interface TimelineScrollerProps {
    photos: Photo[];
    gridContainerId?: string;
}

export function TimelineScroller({ photos, gridContainerId = 'photo-grid' }: TimelineScrollerProps) {
    const groups = useMemo(() => groupPhotosByDate(photos), [photos]);
    const yearMonthGroups = useMemo(() => groupPhotosByYearMonth(photos), [photos]);
    const { setScrollToGroupId } = usePhotos();
    const [isDragging, setIsDragging] = useState(false);
    const [showLabel, setShowLabel] = useState(false);
    const [showExpandedPanel, setShowExpandedPanel] = useState(false);
    const [currentLabel, setCurrentLabel] = useState('');
    const [thumbPosition, setThumbPosition] = useState(0);
    const hideTimeoutRef = useRef<number | undefined>(undefined);
    const gridElementRef = useRef<HTMLElement | null>(null);
    const hoverTimeoutRef = useRef<number | undefined>(undefined);

    // Calculate which date label to show based on scroll position
    const updateLabel = useCallback((scrollTop: number, scrollHeight: number, clientHeight: number) => {
        if (groups.length === 0) return;

        const scrollPercentage = scrollHeight > clientHeight
            ? scrollTop / (scrollHeight - clientHeight)
            : 0;
        const index = Math.floor(scrollPercentage * groups.length);
        const clampedIndex = Math.max(0, Math.min(index, groups.length - 1));

        if (groups[clampedIndex]) {
            const date = groups[clampedIndex].date;
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            setCurrentLabel(`${month} ${year}`);
        }

        // Calculate thumb position (60px is thumb height)
        const maxThumbPosition = clientHeight - 60;
        const thumbPos = scrollPercentage * maxThumbPosition;
        setThumbPosition(thumbPos);
    }, [groups]);

    const handleScroll = useCallback(() => {
        if (!gridElementRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = gridElementRef.current;
        updateLabel(scrollTop, scrollHeight, clientHeight);

        setShowLabel(true);

        // Hide label after 1 second of no scrolling
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = window.setTimeout(() => {
            if (!isDragging) {
                setShowLabel(false);
            }
        }, 1000);
    }, [updateLabel, isDragging]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setShowLabel(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !gridElementRef.current) return;

        const gridRect = gridElementRef.current.getBoundingClientRect();
        const y = e.clientY - gridRect.top;
        const percentage = Math.max(0, Math.min(1, y / gridRect.height));

        const { scrollHeight, clientHeight } = gridElementRef.current;
        gridElementRef.current.scrollTop = percentage * (scrollHeight - clientHeight);
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        // Hide label after a short delay
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = window.setTimeout(() => {
            setShowLabel(false);
        }, 800);
    }, []);

    const handlePanelMouseEnter = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setShowExpandedPanel(true);
    }, []);

    const handlePanelMouseLeave = useCallback(() => {
        hoverTimeoutRef.current = window.setTimeout(() => {
            setShowExpandedPanel(false);
        }, 300);
    }, []);

    const scrollToSection = useCallback((sectionId: string) => {
        setScrollToGroupId(sectionId);
    }, [setScrollToGroupId]);

    // Set up scroll listener on the grid element
    useEffect(() => {
        const gridElement = document.getElementById(gridContainerId);
        if (!gridElement) return;

        gridElementRef.current = gridElement;
        gridElement.addEventListener('scroll', handleScroll);

        // Initial update
        handleScroll();

        return () => {
            gridElement.removeEventListener('scroll', handleScroll);
        };
    }, [gridContainerId, handleScroll]);

    // Set up drag listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    if (groups.length === 0) return null;

    return (
        <>
            {/* Hover zone to trigger expanded panel */}
            <div
                onMouseEnter={handlePanelMouseEnter}
                onMouseLeave={handlePanelMouseLeave}
                className={styles.hoverZone}
                style={{ width: showExpandedPanel ? '200px' : '50px' }}
            >
                {/* Expanded year/month panel - always rendered for transition */}
                <div
                    className={`${styles.timelinePanel} ${showExpandedPanel ? styles.timelinePanelVisible : ''}`}
                >
                    {yearMonthGroups.map((yearGroup) => (
                        <div key={yearGroup.year} className={styles.yearGroup}>
                            {/* Year header with horizontal line beside it */}
                            <div
                                onClick={() => {
                                    if (yearGroup.months.length > 0) {
                                        scrollToSection(yearGroup.months[0].sectionId);
                                    }
                                }}
                                className={styles.yearHeader}
                            >
                                {/* Horizontal line */}
                                <div className={styles.yearLine} />
                                {/* Year text */}
                                <span>{yearGroup.year}</span>
                            </div>

                            {/* Month list */}
                            <div className={styles.monthList}>
                                {yearGroup.months.map((monthGroup) => (
                                    <div
                                        key={`${monthGroup.year}-${monthGroup.monthNumber}`}
                                        onClick={() => scrollToSection(monthGroup.sectionId)}
                                        className={styles.monthItem}
                                    >
                                        {/* Dot */}
                                        <div className={styles.monthDot} />

                                        {/* Tooltip on hover */}
                                        <div className={styles.monthTooltip}>
                                            {monthGroup.date.toLocaleString('default', { month: 'long' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Custom scrollbar thumb */}
                <div
                    onMouseDown={handleMouseDown}
                    className={`${styles.scrollThumb} ${isDragging ? styles.scrollThumbDragging : styles.scrollThumbIdle} ${showLabel || showExpandedPanel ? styles.scrollThumbActive : styles.scrollThumbInactive}`}
                    style={{ top: `${thumbPosition}px` }}
                />
            </div>

            {/* Floating date label */}
            {
                showLabel && !showExpandedPanel && (
                    <div
                        className={styles.floatingLabel}
                        style={{ top: `calc(64px + ${thumbPosition + 15}px)` }}
                    >
                        {currentLabel}
                    </div>
                )
            }
        </>
    );
}
