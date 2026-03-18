import type { Server } from 'socket.io';
import { config } from '@config/env';

class SocketService {
  private io?: Server;

  init(server: Server) {
    this.io = server;
  }

  private emitToMembers(event: string, payload: unknown) {
    if (!this.io || !config.features.socketNotifications) {
      return;
    }
    this.io.of('/members').emit(event, payload);
  }

  emitProductEvent(event: string, payload: unknown) {
    this.emitToMembers(`products:${event}`, payload);
  }
}

export const socketService = new SocketService();
