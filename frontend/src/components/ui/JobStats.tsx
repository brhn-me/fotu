// src/components/ui/JobStats.tsx

interface JobStatsProps {
    total: number;
    completed: number;
    failed: number;
}

export function JobStats({ total, completed, failed }: JobStatsProps) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "18px", whiteSpace: "nowrap" }}>
            <StatItem label="TOTAL" value={total} color="var(--text-muted)" />
            <StatItem label="DONE" value={completed} color="var(--status-success)" />
            <StatItem label="FAIL" value={failed} color="var(--status-error)" />
        </div>
    );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
    const formattedValue = value.toLocaleString();

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: color, opacity: 0.7 }} />
            <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--text-muted)", letterSpacing: 0.5 }}>
                {label} <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formattedValue}</span>
            </span>
        </div>
    );
}
