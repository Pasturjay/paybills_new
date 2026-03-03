import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketClient {
    private static instance: SocketClient;
    private socket: Socket | null = null;

    private constructor() { }

    public static getInstance(): SocketClient {
        if (!SocketClient.instance) {
            SocketClient.instance = new SocketClient();
        }
        return SocketClient.instance;
    }

    public connect(token: string) {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    public off(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }
}

export const socketClient = SocketClient.getInstance();
