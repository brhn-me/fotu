import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './CollapsibleCard.module.css';

interface CollapsibleCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function CollapsibleCard({ title, description, children, defaultOpen = true }: CollapsibleCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={styles.card}>
            <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.titleGroup}>
                    <h3 className={styles.title}>{title}</h3>
                    {description && <p className={styles.description}>{description}</p>}
                </div>
                <ChevronDown
                    size={20}
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                />
            </div>
            {isOpen && <div className={styles.content}>{children}</div>}
        </div>
    );
}
