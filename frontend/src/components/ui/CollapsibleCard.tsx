import React, { useState } from 'react';
import { ChevronDown, Settings2 } from 'lucide-react';
import styles from './CollapsibleCard.module.css';

interface CollapsibleCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    icon?: React.ReactNode;
}

export function CollapsibleCard({
    title,
    description,
    children,
    defaultOpen = true,
    icon = <Settings2 size={20} />
}: CollapsibleCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={styles.card}>
            <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.titleGroup}>
                    <div className={styles.iconBox}>
                        {icon}
                    </div>
                    <div className={styles.textContent}>
                        <h3 className={styles.title}>{title}</h3>
                        {description && <p className={styles.description}>{description}</p>}
                    </div>
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
