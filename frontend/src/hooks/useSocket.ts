import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Singleton socket connection
let socket: Socket;

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true
        });
    }
    return socket;
};

export function useSocket() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = getSocket();

        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);

        // Check initial state
        if (socketInstance.connected) {
            onConnect();
        }

        return () => {
            socketInstance.off('connect', onConnect);
            socketInstance.off('disconnect', onDisconnect);
        };
    }, []);

    return { socket: getSocket(), isConnected };
}
