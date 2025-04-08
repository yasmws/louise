import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import {
  Observable,
  Subject,
  ReplaySubject,
  takeUntil,
  share,
} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private disconnect$ = new Subject<void>();
  private eventsMap = new Map<string, ReplaySubject<any>>();

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

    this.socket.on('disconnect', reason => {
      console.log('[Socket.IO] Desconectado:', reason);
      this.disconnect$.next();
    });

    this.socket.on('connect_error', err => {
      console.error('[Socket.IO] Erro de conexão:', err.message);
    });
  }

  public emit(event: string, ...args: any[]): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, ...args);
      console.log('[Socket.IO] Emissão:', event, ...args);
    } else {
      console.warn('[Socket.IO] Não conectado, não foi possível emitir', event);
    }
  }

  /**
   * Retorna um Observable do evento especificado.
   * Usa multicasting com ReplaySubject para reemitir a última mensagem para novos assinantes.
   */
  public on<T = any>(event: string): Observable<T> {
    if (this.eventsMap.has(event)) {
      return this.eventsMap.get(event)!.asObservable();
    }

    const event$ = new ReplaySubject<T>(1); // último valor para novos assinantes
    this.eventsMap.set(event, event$);

    this.socket?.on(event, (data: T) => {
      event$.next(data);
    });

    return event$.asObservable().pipe(
      takeUntil(this.disconnect$), // limpa ao desconectar
      share() // multicast para múltiplos assinantes
    );
  }

  public off(event: string): void {
    this.socket?.off(event);
    this.eventsMap.delete(event);
  }

  public disconnect(): void {
    this.disconnect$.next();
    this.socket?.disconnect();
    this.socket = null;
    this.eventsMap.clear();
  }

  public isConnected(): boolean {
    return !!this.socket?.connected;
  }

  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  public listenOnce<T = any>(event: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      console.warn('[Socket.IO] Socket não conectado. Evento ignorado:', event);
      return () => {};
    }
  
    const handler = (data: T) => {
      callback(data);
    };
  
    this.socket.on(event, handler);
  
    // Retorna função para remover o ouvinte se necessário
    return () => {
      this.socket?.off(event, handler);
    };
  }
}
export const webSocketService = new WebSocketService();