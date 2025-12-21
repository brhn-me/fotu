import type { Photo } from '../types';
import { groupPhotosByDate, groupPhotosByYearMonth } from '../utils/photoUtils';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';

interface TimelineScrollerProps {
    photos: Photo[];
    gridContainerId?: string;
}

export function TimelineScroller({ photos, gridContainerId = 'photo-grid' }: TimelineScrollerProps) {
    const groups = useMemo(() => groupPhotosByDate(photos), [photos]);
    const yearMonthGroups = useMemo(() => groupPhotosByYearMonth(photos), [photos]);
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
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

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
                style={{
                    position: 'fixed',
                    right: 0,
                    top: '64px',
                    bottom: 0,
                    width: showExpandedPanel ? '200px' : '50px',
                    pointerEvents: 'auto',
                    zIndex: 999,
                    transition: 'width 0.2s ease',
                }}
            >
                {/* Expanded year/month panel */}
                {showExpandedPanel && (
                    <div
                        className="timeline-panel"
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '200px',
                            background: 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.8) 100%)',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            padding: '16px 20px 16px 40px',
                            animation: 'fadeIn 0.2s ease-out',
                            borderRight: '3px solid var(--text-muted)',
                        }}>
                        {yearMonthGroups.map((yearGroup) => (
                            <div key={yearGroup.year} style={{ marginBottom: '12px', textAlign: 'right' }}>
                                {/* Year header with horizontal line beside it */}
                                <div
                                    onClick={() => {
                                        if (yearGroup.months.length > 0) {
                                            scrollToSection(yearGroup.months[0].sectionId);
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: '8px',
                                        fontSize: '15px',
                                        fontWeight: 400,
                                        color: 'var(--text-primary)',
                                        padding: '6px 0',
                                        cursor: 'pointer',
                                        transition: 'color 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'hsl(220, 90%, 56%)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                >
                                    {/* Horizontal line */}
                                    <div style={{
                                        width: '24px',
                                        height: '1px',
                                        backgroundColor: 'var(--text-muted)',
                                    }} />
                                    {/* Year text */}
                                    <span>{yearGroup.year}</span>
                                </div>

                                {/* Month list */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '4px',
                                    marginTop: '6px',
                                    marginBottom: '6px'
                                }}>
                                    {yearGroup.months.map((monthGroup) => (
                                        <div
                                            key={`${monthGroup.year}-${monthGroup.monthNumber}`}
                                            onClick={() => scrollToSection(monthGroup.sectionId)}
                                            style={{
                                                position: 'relative',
                                                cursor: 'pointer',
                                                padding: '2px',
                                            }}
                                        >
                                            {/* Dot */}
                                            <div
                                                style={{
                                                    width: '4px',
                                                    height: '4px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--text-muted)',
                                                    transition: 'all 0.15s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'hsl(220, 90%, 56%)';
                                                    e.currentTarget.style.transform = 'scale(1.5)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'var(--text-muted)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            />

                                            {/* Tooltip on hover */}
                                            <div
                                                className="month-tooltip"
                                                style={{
                                                    position: 'absolute',
                                                    right: '14px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    padding: '4px 10px',
                                                    backgroundColor: 'var(--bg-surface)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    borderRadius: '4px',
                                                    whiteSpace: 'nowrap',
                                                    opacity: 0,
                                                    pointerEvents: 'none',
                                                    transition: 'opacity 0.15s ease',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                                }}
                                            >
                                                {monthGroup.date.toLocaleString('default', { month: 'long' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Custom scrollbar thumb */}
                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        position: 'absolute',
                        right: '6px',
                        top: `${thumbPosition}px`,
                        width: '6px',
                        height: '60px',
                        backgroundColor: isDragging ? 'var(--text-secondary)' : 'var(--text-muted)',
                        borderRadius: '3px',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        transition: isDragging ? 'none' : 'background-color 0.2s ease',
                        opacity: showLabel || showExpandedPanel ? 0.8 : 0.4,
                        zIndex: 1002,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                />
            </div >

            {/* Floating date label */}
            {
                showLabel && !showExpandedPanel && (
                    <div style={{
                        position: 'fixed',
                        right: '24px',
                        top: `calc(64px + ${thumbPosition + 15}px)`,
                        padding: '8px 14px',
                        backgroundColor: 'var(--glass-bg)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: 'var(--text-primary)',
                        pointerEvents: 'none',
                        zIndex: 1001,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        whiteSpace: 'nowrap',
                        animation: 'fadeInSlide 0.2s ease-out',
                    }}>
                        {currentLabel}
                    </div>
                )
            }

            <style>{`
                @keyframes fadeInSlide {
                    from {
                        opacity: 0;
                        transform: translateX(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                /* Dark mode gradient support */
                [data-theme='dark'] .timeline-panel {
                    background: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.8) 100%) !important;
                }
                
                /* Show tooltip on hover */
                div:hover > .month-tooltip {
                    opacity: 1 !important;
                }
            `}</style>
        </>
    );
}
