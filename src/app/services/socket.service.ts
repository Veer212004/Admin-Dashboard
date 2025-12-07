import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private onlineCountSubject = new BehaviorSubject<number>(0);
  public onlineCount$ = this.onlineCountSubject.asObservable();

  constructor() {}

  connect(userId: string, role: string): void {
    if (this.socket) {
      return;
    }

    this.socket = io(environment.socketUrl, {
      path: environment.socketPath,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.socket?.emit('registerUserSocket', { userId, role });
    });

    this.socket.on('onlineCountUpdate', (data: any) => {
      this.onlineCountSubject.next(data.count);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      if (this.socket) {
        this.socket.on(event, (data: T) => {
          observer.next(data);
        });
      }
    });
  }

  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  joinRoom(room: string): void {
    this.emit('joinBoardRoom', { boardId: room });
  }

  leaveRoom(room: string): void {
    this.emit('leaveBoardRoom', { boardId: room });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}
