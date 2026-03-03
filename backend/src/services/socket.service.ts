import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

export class SocketService {
    private static instance: SocketService;
    private io: SocketServer | null = null;
    private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public initialize(server: HttpServer) {
        this.io = new SocketServer(server, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
                methods: ['GET', 'POST']
            }
        });

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                (socket as any).userId = decoded.id;
                next();
            } catch (err) {
                next(new Error('Authentication error: Invalid token'));
            }
        });

        this.io.on('connection', (socket) => {
            const userId = (socket as any).userId;
            console.log(`User connected to socket: ${userId} (${socket.id})`);

            // Add to map
            const sockets = this.userSockets.get(userId) || [];
            sockets.push(socket.id);
            this.userSockets.set(userId, sockets);

            // Join a private room for the user
            socket.join(`user:${userId}`);

            socket.on('disconnect', () => {
                const updatedSockets = (this.userSockets.get(userId) || []).filter(id => id !== socket.id);
                if (updatedSockets.length === 0) {
                    this.userSockets.delete(userId);
                } else {
                    this.userSockets.set(userId, updatedSockets);
                }
                console.log(`User disconnected from socket: ${userId} (${socket.id})`);
            });
        });
    }

    public emitToUser(userId: string, event: string, data: any) {
        if (this.io) {
            this.io.to(`user:${userId}`).emit(event, data);
        }
    }

    public emitToAll(event: string, data: any) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}

export const socketService = SocketService.getInstance();
