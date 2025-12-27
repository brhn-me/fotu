// src/components/ui/ProgressBar.tsx
import styles from '../../pages/jobs/Jobs.module.css';

interface ProgressBarProps {
    progress: number;
    status: 'running' | 'paused' | 'completed';
    showPercentage?: boolean;
}

export function ProgressBar({ progress, status, showPercentage = true }: ProgressBarProps) {
    const getProgressColor = () => {
        if (status === 'completed') return 'var(--status-success)';
        if (status === 'running') return 'var(--status-success)';
        if (status === 'paused') return 'var(--text-muted)';
        return 'var(--accent-primary)';
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <div className={styles.progressContainer} style={{ flex: 1 }}>
                <div className={styles.progressBarTrack}>
                    <div
                        className={styles.progressBarFill}
                        style={{
                            width: `${progress}%`,
                            backgroundColor: getProgressColor(),
                        }}
                    />
                    {status === "running" && progress > 0 && progress < 100 ? (
                        <div className={styles.progressShimmer} />
                    ) : null}
                </div>
            </div>
            {showPercentage && (
                <span className={styles.progressText}>
                    {Math.round(progress)}%
                </span>
            )}
        </div>
    );
}
