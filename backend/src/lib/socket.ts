import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: '*', // Adjust for production
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('Client connected to socket:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    console.log('Socket.IO initialized');
    return io;
}

export function getSocket() {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
}

export function emitJobUpdate(jobId: string, status: string, data?: any) {
    if (io) {
        io.emit('job-update', { id: jobId, status, ...data });
    }
}

// Helper for generic events
export function emitEvent(event: string, data: any) {
    if (io) {
        io.emit(event, data);
    }
}
