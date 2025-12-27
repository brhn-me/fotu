// src/components/ui/ConcurrencyIndicator.tsx
import { Cpu } from 'lucide-react';

interface ConcurrencyIndicatorProps {
    count: number;
}

export function ConcurrencyIndicator({ count }: ConcurrencyIndicatorProps) {
    return (
        <div
            title={`${count} concurrent workers`}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: "var(--text-muted)",
                whiteSpace: "nowrap"
            }}
        >
            <Cpu size={14} />
            <span>{count}</span>
        </div>
    );
}
