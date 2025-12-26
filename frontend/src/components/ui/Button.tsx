// src/components/ui/Button.tsx
import React from 'react';
import shared from '../../styles/shared.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

export function Button({
    variant = 'secondary',
    size = 'md',
    loading,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const getVariantClass = () => {
        switch (variant) {
            case 'primary': return shared.btnPrimary;
            case 'danger': return shared.btnDanger;
            case 'ghost': return ""; // Typically bare or just hover effects
            default: return ""; // Secondary/Default usually handled by base btn class
        }
    };

    const getSizeClass = () => {
        // You can add specific size classes to shared.module.css if needed in future
        // For now, we'll assume default padding or override via className
        return "";
    };

    return (
        <button
            className={`${shared.btn} ${getVariantClass()} ${getSizeClass()} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className={shared.animateSpin}>⟳</span>}
            {!loading && icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
            {children}
        </button>
    );
}
