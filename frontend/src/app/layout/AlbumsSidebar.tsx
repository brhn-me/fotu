// src/components/AlbumsSidebar.tsx

import { useMemo, useState, useEffect } from "react";
import type { Photo } from "../../types";
import { ChevronDown } from "lucide-react";
import { groupPhotosByDate } from "../../utils/photoUtils";
import { Virtuoso } from "react-virtuoso";
import styles from "./AlbumsSidebar.module.css";

type DateKey = string; // "YYYY-MM-DD"

type DateNode = {
    dateKey: DateKey;
    sectionId: string;
    label: string;
    thumbnailUrl: string;
    date: Date;
};

type MonthNode = {
    month: number;
    label: string;
    dates: DateNode[];
};

type YearNode = {
    year: number;
    months: MonthNode[];
};

// Flattened item types for Virtualizer
type FlatItem =
    | { type: 'year'; year: number }
    | { type: 'month'; year: number; month: number; label: string }
    | { type: 'date'; sectionId: string; dateKey: DateKey; label: string; thumbnailUrl: string };

function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

function toDateKeyLocal(d: Date): DateKey {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthName(m: number): string {
    const names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    return names[m - 1] ?? `Month ${m}`;
}

export function AlbumsSidebar({
    photos,
    isMainSidebarOpen,
    onSelectSection,
    selectedSectionId,
}: {
    photos: Photo[];
    isMainSidebarOpen: boolean;
    onSelectSection: (sectionId: string, dateKey: DateKey) => void;
    selectedSectionId: string | null;
}) {
    // 1. Prepare raw tree structure (Memorized)
    const dateNodes: DateNode[] = useMemo(() => {
        const groups = groupPhotosByDate(photos);
        return groups
            .map((g) => {
                const first = g.photos[0];
                if (!first) return null;
                return {
                    dateKey: toDateKeyLocal(g.date),
                    sectionId: g.id,
                    label: g.label,
                    thumbnailUrl: first.thumbnailUrl,
                    date: g.date,
                } satisfies DateNode;
            })
            .filter((x): x is DateNode => Boolean(x))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [photos]);

    const tree: YearNode[] = useMemo(() => {
        const byYear = new Map<number, Map<number, DateNode[]>>();
        for (const node of dateNodes) {
            const y = node.date.getFullYear();
            const m = node.date.getMonth() + 1;
            if (!byYear.has(y)) byYear.set(y, new Map());
            const byMonth = byYear.get(y)!;
            if (!byMonth.has(m)) byMonth.set(m, []);
            byMonth.get(m)!.push(node);
        }
        const years = Array.from(byYear.keys()).sort((a, b) => b - a);
        return years.map((y) => {
            const monthMap = byYear.get(y)!;
            const months = Array.from(monthMap.keys()).sort((a, b) => b - a);
            return {
                year: y,
                months: months.map((m) => ({
                    month: m,
                    label: monthName(m),
                    dates: (monthMap.get(m) ?? []).sort((a, b) => b.date.getTime() - a.date.getTime()),
                })),
            };
        });
    }, [dateNodes]);

    // 2. Manage Expand/Collapse States
    const [openYears, setOpenYears] = useState<Record<number, boolean>>({});
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({}); // "year-month"

    // Initial Auto-Open
    useEffect(() => {
        if (tree.length === 0) return;
        const newest = tree[0];
        setOpenYears(prev => ({ [newest.year]: true, ...prev })); // Ensure newest open, keeping others if any

        if (newest.months.length > 0) {
            const newestMonth = newest.months[0];
            const key = `${newest.year}-${newestMonth.month}`;
            setOpenMonths(prev => ({ [key]: true, ...prev }));
        }
    }, [tree]); // Only re-run if tree structure completely changes (e.g. reload), actually dependencies might need tuning but for now ok.

    // 3. Flatten Items based on visibility
    const flatItems: FlatItem[] = useMemo(() => {
        const items: FlatItem[] = [];
        for (const yNode of tree) {
            const isYearOpen = openYears[yNode.year];
            items.push({ type: 'year', year: yNode.year });

            if (isYearOpen) {
                for (const mNode of yNode.months) {
                    const mKey = `${yNode.year}-${mNode.month}`;
                    const isMonthOpen = openMonths[mKey];
                    items.push({ type: 'month', year: yNode.year, month: mNode.month, label: mNode.label });

                    if (isMonthOpen) {
                        for (const dNode of mNode.dates) {
                            items.push({
                                type: 'date',
                                sectionId: dNode.sectionId,
                                dateKey: dNode.dateKey,
                                label: dNode.label,
                                thumbnailUrl: dNode.thumbnailUrl
                            });
                        }
                    }
                }
            }
        }
        return items;
    }, [tree, openYears, openMonths]);

    return (
        <aside className={`${styles.sidebar} ${isMainSidebarOpen ? styles.sidebarExpanded : styles.sidebarCollapsed}`}>
            <div className={styles.header}>
                <div className={styles.title}>Albums</div>
            </div>

            <div className={styles.content}>
                {flatItems.length === 0 ? (
                    <div className={styles.emptyState}>No data yet.</div>
                ) : (
                    <Virtuoso
                        className={styles.virtuoso}
                        data={flatItems}
                        itemContent={(_, item) => {
                            if (item.type === 'year') {
                                const isOpen = openYears[item.year] ?? false;
                                return (
                                    <div className={styles.yearContainer}>
                                        <button
                                            onClick={() => setOpenYears(prev => ({ ...prev, [item.year]: !isOpen }))}
                                            className={styles.yearButton}
                                        >
                                            <span className={styles.yearText}>{item.year}</span>
                                            <ChevronDown
                                                size={16}
                                                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                                            />
                                        </button>
                                    </div>
                                );
                            } else if (item.type === 'month') {
                                const key = `${item.year}-${item.month}`;
                                const isOpen = openMonths[key] ?? false;
                                return (
                                    <div className={styles.monthContainer}>
                                        <button
                                            onClick={() => setOpenMonths(prev => ({ ...prev, [key]: !isOpen }))}
                                            className={styles.monthButton}
                                        >
                                            <span className={styles.monthText}>{item.label}</span>
                                            <ChevronDown
                                                size={16}
                                                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                                            />
                                        </button>
                                    </div>
                                );
                            } else {
                                // Date Item
                                const selected = selectedSectionId === item.sectionId;
                                return (
                                    <div className={styles.dateContainer}>
                                        <button
                                            onClick={() => onSelectSection(item.sectionId, item.dateKey)}
                                            className={`${styles.dateButton} ${selected ? styles.selected : ''}`}
                                        >
                                            <div className={styles.thumbnailContainer}>
                                                <img
                                                    src={item.thumbnailUrl}
                                                    alt={item.dateKey}
                                                    className={styles.thumbnail}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className={styles.dateInfo}>
                                                <div className={styles.dateText}>
                                                    {item.dateKey}
                                                </div>
                                                <div className={styles.countText}>
                                                    {item.label}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            }
                        }}
                    />
                )}
            </div>

            <style>{`
                /* Ensure Virtuoso's scroller has a nice scrollbar */
                div[data-test-id="virtuoso-scroller"]::-webkit-scrollbar {
                    width: 8px;
                    display: block;
                }
                div[data-test-id="virtuoso-scroller"]::-webkit-scrollbar-track {
                    background: transparent;
                }
                div[data-test-id="virtuoso-scroller"]::-webkit-scrollbar-thumb {
                    background-color: var(--border-subtle);
                    border-radius: 4px;
                }
                div[data-test-id="virtuoso-scroller"]::-webkit-scrollbar-thumb:hover {
                    background-color: var(--text-secondary);
                }
            `}</style>
        </aside>
    );
}
