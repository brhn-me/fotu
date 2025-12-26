// src/components/ui/Card.tsx
import React from 'react';
import shared from '../../styles/shared.module.css';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`${shared.card} ${className}`}>{children}</div>;
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
