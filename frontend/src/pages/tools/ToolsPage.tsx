
import React from 'react';

interface ToolsPageProps {
    title: string;
    description: string;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({ title, description }) => {
    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>{title}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
        </div>
    );
};
