import { io, Socket } from 'socket.io-client';

export class WebSocketService {
    private static instance: WebSocketService;
    private socket: Socket | null = null;

    constructor() {}

    public connect(url: string): void {
        if (this.socket && this.socket.connected) {
            console.warn('[Socket.IO] Já está conectado.');
            return;
        }

        this.socket = io(url, {
            transports: ['websocket'],
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('[Socket.IO] Conectado!', this.socket!.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[Socket.IO] Desconectado:', reason);
        });

        this.socket.on('connect_error', (err) => {
            console.error('[Socket.IO] Erro de conexão:', err.message);
        });

        // Exemplo: ouça mensagens genéricas
        this.socket.on('message', (data) => {
            console.log('[Socket.IO] Mensagem recebida:', data);
        });
    }

    public emit(event: string, ...args: any[]): void {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, ...args);
            console.log('emitiu', event, ...args);
        } else {
            console.warn('[Socket.IO] Não conectado, não foi possível emitir', event);
        }
    }

    public on(event: string, callback: (data: any) => void): void {
        this.socket?.on(event, callback);
    }

    public off(event: string, callback?: (data: any) => void): void {
        this.socket?.off(event, callback);
    }

    public disconnect(): void {
        this.socket?.disconnect();
    }

    public isConnected(): boolean {
        return !!this.socket?.connected;
    }

    public getSocketId(): string | undefined {
        return this.socket?.id;
    }
}

export const webSocketService = new WebSocketService();