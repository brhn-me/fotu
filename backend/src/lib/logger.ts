import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

class Logger {
    private jobType: string;
    private logFile: string;

    constructor(jobType: string) {
        this.jobType = jobType;
        this.logFile = path.join(LOG_DIR, `${jobType}.log`);
        // Removed combinedFile
    }

    private formatMessage(level: string, message: string, data?: any): string {
        const date = new Date();
        const timestamp = date.toISOString().replace('T', ' ').replace(/\..+/, ''); // YYYY-MM-DD HH:mm:ss
        let dataStr = '';

        if (data) {
            if (data instanceof Error) {
                dataStr = `\n  Error: ${data.message}\n  Stack: ${data.stack}`;
            } else if (data.error && (typeof data.error === 'string' || data.error instanceof Error)) {
                const errMsg = data.error instanceof Error ? data.error.message : data.error;
                const stack = data.error instanceof Error ? data.error.stack : data.stack; // sometimes stack is separate
                if (stack) {
                    dataStr = `\n  Error: ${errMsg}\n  Stack: ${stack}`;
                } else {
                    dataStr = `\n  Error: ${errMsg}`;
                }
                // Add extra data if any
                if (data.data) {
                    dataStr += `\n  Payload: ${JSON.stringify(data.data)}`;
                }
            } else {
                try {
                    // check if it's "data" wrapper or just raw object
                    const payload = data.data || data;
                    const json = JSON.stringify(payload, null, 2); // Pretty print
                    // Indent all lines
                    dataStr = '\n' + json.split('\n').map(l => '  ' + l).join('\n');
                } catch {
                    dataStr = ' | [Circular/Invalid Data]';
                }
            }
        }

        // Simpler header: [Time] [LEVEL] Message
        // We know the file is the job type, so we can omit [jobType] if we want, but keeping it is fine.
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}\n`;
    }

    private write(level: string, message: string, data?: any) {
        const line = this.formatMessage(level, message, data);

        // Append to specific job log
        fs.appendFile(this.logFile, line, (err) => {
            if (err) {
                // Fallback to console if file write fails, otherwise silent
                console.error(`Failed to write to ${this.logFile}`, err);
            }
        });

        // Console logging:
        // User requested NO job logs in console.
        // We will strictly suppress INFO/WARN. 
        // We will allow ERROR to show in console for critical system visibility?
        // User said "job logs should not appear in console", "errors should be logged properly".
        // Use judgment: Errors normally go to file + console. But complying with request:
        // File only for jobs.
        // if (level === 'error') console.error(line.trim()); 
    }

    info(message: string, data?: any) {
        this.write('info', message, data);
    }

    warn(message: string, data?: any) {
        this.write('warn', message, data);
    }

    error(message: string, data?: any) {
        this.write('error', message, data);
    }
}

// Singleton map to reuse loggers
const loggers: Map<string, Logger> = new Map();

export function getLogger(jobType: string): Logger {
    if (!loggers.has(jobType)) {
        loggers.set(jobType, new Logger(jobType));
    }
    return loggers.get(jobType)!;
}
