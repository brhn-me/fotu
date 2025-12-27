// src/components/ui/Card.tsx
import shared from '../../styles/shared.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function Card({ children, className = '', style }: CardProps) {
    return <div className={`${shared.card} ${className}`} style={style}>{children}</div>;
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`${shared.cardHeader} ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`${shared.cardBody} ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <h3 className={`${shared.cardTitle} ${className}`}>{children}</h3>;
}
