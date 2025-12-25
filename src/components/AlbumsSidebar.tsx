// src/components/AlbumsSidebar.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Photo } from "../types";
import { ChevronDown } from "lucide-react";
import { groupPhotosByDate } from "../utils/photoUtils";

type DateKey = string; // "YYYY-MM-DD"

type DateNode = {
    dateKey: DateKey;     // YYYY-MM-DD (for display + grouping)
    sectionId: string;    // existing PhotoGrid <section id={group.id}>
    label: string;        // "Today", "Yesterday", "Wednesday, August 13"
    thumbnailUrl: string;
    date: Date;           // for sorting
};

type MonthNode = {
    month: number; // 1..12
    label: string; // e.g. "August"
    dates: DateNode[];
};

type YearNode = {
    year: number;
    months: MonthNode[];
};

function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

function toDateKeyLocal(d: Date): DateKey {
    // Use local calendar date (matches your UI labels)
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
    /**
     * Build from the exact same groups PhotoGrid uses,
     * WITHOUT changing groupPhotosByDate() output.
     */
    const dateNodes: DateNode[] = useMemo(() => {
        const groups = groupPhotosByDate(photos);

        return groups
            .map((g) => {
                const first = g.photos[0];
                if (!first) return null;

                const dateKey = toDateKeyLocal(g.date);
                return {
                    dateKey,
                    sectionId: g.id, // keep your existing id like "group-2025-08-13T00:00:00.000Z"
                    label: g.label,
                    thumbnailUrl: first.thumbnailUrl,
                    date: g.date,
                } satisfies DateNode;
            })
            .filter((x): x is DateNode => Boolean(x))
            .sort((a, b) => b.date.getTime() - a.date.getTime()); // newest first
    }, [photos]);

    const tree: YearNode[] = useMemo(() => {
        const byYear = new Map<number, Map<number, DateNode[]>>();

        for (const node of dateNodes) {
            const y = node.date.getFullYear();
            const m = node.date.getMonth() + 1; // 1..12

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

    // Infinite scroll by years
    const PAGE_SIZE = 6;
    const [yearCount, setYearCount] = useState(PAGE_SIZE);

    useEffect(() => {
        setYearCount(PAGE_SIZE);
    }, [photos]);

    const visibleYears = useMemo(() => tree.slice(0, yearCount), [tree, yearCount]);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setYearCount((prev) => Math.min(prev + PAGE_SIZE, tree.length));
                }
            },
            { threshold: 0.1 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [tree.length]);

    // Accordion open state
    const [openYears, setOpenYears] = useState<Record<number, boolean>>({});
    const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({}); // `${year}-${month}`

    // Auto-open the newest year/month by default
    useEffect(() => {
        if (tree.length === 0) return;
        const newest = tree[0];
        if (!newest) return;

        setOpenYears((prev) => (prev[newest.year] === undefined ? { ...prev, [newest.year]: true } : prev));

        const newestMonth = newest.months[0];
        if (newestMonth) {
            const key = `${newest.year}-${newestMonth.month}`;
            setOpenMonths((prev) => (prev[key] === undefined ? { ...prev, [key]: true } : prev));
        }
    }, [tree]);

    const width = isMainSidebarOpen ? 320 : 280;

    return (
        <aside
            style={{
                width,
                height: "100%",
                borderRight: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-primary)",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div style={{ padding: "16px 16px 8px 16px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Albums</div>
            </div>

            <div style={{ overflowY: "auto", padding: "8px 8px 16px 8px", scrollbarWidth: "none" }}>
                {visibleYears.length === 0 ? (
                    <div style={{ padding: 16, color: "var(--text-secondary)", fontSize: 13 }}>No data yet.</div>
                ) : (
                    visibleYears.map((yNode) => {
                        const yOpen = openYears[yNode.year] ?? false;

                        return (
                            <div key={yNode.year} style={{ marginBottom: 8 }}>
                                <button
                                    onClick={() => setOpenYears((prev) => ({ ...prev, [yNode.year]: !yOpen }))}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "10px 12px",
                                        borderRadius: 12,
                                        border: "1px solid var(--border-subtle)",
                                        background: "var(--bg-secondary)",
                                        cursor: "pointer",
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{yNode.year}</span>
                                    <ChevronDown
                                        size={16}
                                        style={{
                                            color: "var(--text-secondary)",
                                            transform: yOpen ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "transform 0.15s ease",
                                        }}
                                    />
                                </button>

                                {yOpen && (
                                    <div style={{ padding: "6px 4px 0 4px" }}>
                                        {yNode.months.map((mNode) => {
                                            const key = `${yNode.year}-${mNode.month}`;
                                            const mOpen = openMonths[key] ?? false;

                                            return (
                                                <div key={key} style={{ marginTop: 6 }}>
                                                    <button
                                                        onClick={() => setOpenMonths((prev) => ({ ...prev, [key]: !mOpen }))}
                                                        style={{
                                                            width: "100%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                            padding: "10px 12px",
                                                            borderRadius: 12,
                                                            border: "1px solid transparent",
                                                            background: "transparent",
                                                            cursor: "pointer",
                                                            color: "var(--text-primary)",
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                                    >
                                                        <span style={{ fontSize: 13, fontWeight: 500 }}>{mNode.label}</span>
                                                        <ChevronDown
                                                            size={16}
                                                            style={{
                                                                color: "var(--text-secondary)",
                                                                transform: mOpen ? "rotate(180deg)" : "rotate(0deg)",
                                                                transition: "transform 0.15s ease",
                                                            }}
                                                        />
                                                    </button>

                                                    {mOpen && (
                                                        <div style={{ padding: "2px 6px 8px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
                                                            {mNode.dates.map((dNode) => {
                                                                const selected = selectedSectionId === dNode.sectionId;

                                                                return (
                                                                    <button
                                                                        key={dNode.sectionId}
                                                                        onClick={() => onSelectSection(dNode.sectionId, dNode.dateKey)}
                                                                        style={{
                                                                            width: "100%",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 10,
                                                                            padding: "8px 10px",
                                                                            borderRadius: 12,
                                                                            border: selected ? "1px solid var(--accent-primary)" : "1px solid transparent",
                                                                            background: selected ? "rgba(52, 168, 83, 0.12)" : "transparent",
                                                                            cursor: "pointer",
                                                                            textAlign: "left",
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (!selected) e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (!selected) e.currentTarget.style.backgroundColor = "transparent";
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                width: 34,
                                                                                height: 34,
                                                                                borderRadius: 10,
                                                                                backgroundColor: "var(--bg-placeholder)",
                                                                                overflow: "hidden",
                                                                                flexShrink: 0,
                                                                            }}
                                                                        >
                                                                            <img
                                                                                src={dNode.thumbnailUrl}
                                                                                alt={dNode.dateKey}
                                                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                                loading="lazy"
                                                                            />
                                                                        </div>

                                                                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                                                            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                                                                                {dNode.dateKey}
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    fontSize: 12,
                                                                                    color: "var(--text-secondary)",
                                                                                    overflow: "hidden",
                                                                                    textOverflow: "ellipsis",
                                                                                    whiteSpace: "nowrap",
                                                                                }}
                                                                            >
                                                                                {dNode.label}
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                <div ref={sentinelRef} style={{ height: 24 }} />
                <style>{`aside div::-webkit-scrollbar{display:none;}`}</style>
            </div>
        </aside>
    );
}
