// src/components/ui/Badge.tsx
import React from 'react';
import shared from '../../styles/shared.module.css';

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'error';
    children: React.ReactNode;
}

export function Badge({ variant = 'default', children }: BadgeProps) {
    const getVariantClass = () => {
        switch (variant) {
            case 'success': return shared.badgeSuccess;
            case 'warning': return shared.badgeWarning;
            case 'error': return shared.badgeError;
            default: return "";
        }
    };

    return (
        <span className={`${shared.badge} ${getVariantClass()}`}>
            {children}
        </span>
    );
}
