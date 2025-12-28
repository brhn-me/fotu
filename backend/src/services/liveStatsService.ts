import { statsService } from './statsService';
import { emitEvent } from '../lib/socket';

class LiveStatsService {
    private lastUpdate = 0;
    private readonly THROTTLE_MS = 2000; // 2 seconds
    private timeout: NodeJS.Timeout | null = null;
    private isScheduled = false;

    /**
     * Notify that statistics have potentially changed.
     * This method is throttled to avoid excessive DB queries and socket emissions.
     */
    notifyChange() {
        const now = Date.now();

        if (this.isScheduled) {
            return;
        }

        if (now - this.lastUpdate >= this.THROTTLE_MS) {
            // Can update immediately
            this.broadcastStats();
        } else {
            // Schedule an update for later
            this.isScheduled = true;
            const delay = this.THROTTLE_MS - (now - this.lastUpdate);
            this.timeout = setTimeout(() => {
                this.broadcastStats();
                this.isScheduled = false;
            }, delay);
        }
    }

    private async broadcastStats() {
        try {
            this.lastUpdate = Date.now();
            const stats = await statsService.getStats();

            // Serialize BigInts
            const serialized = JSON.parse(JSON.stringify(stats, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));

            emitEvent('stats-updated', serialized);
        } catch (error) {
            console.error('Failed to broadcast live stats:', error);
        }
    }
}

export const liveStatsService = new LiveStatsService();
