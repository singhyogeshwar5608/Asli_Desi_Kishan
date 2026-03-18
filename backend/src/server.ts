import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from '@config/env';
import { connectDb } from '@config/database';
import { seedAdmin } from './scripts/seed-admin.js';
import { socketService } from '@services/socket';

const server = http.createServer(app);

const allowedOrigins = [config.clientWebOrigin, config.clientFlutterOrigin].filter(
  (origin): origin is string => Boolean(origin)
);

const io = new SocketIOServer(server, {
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

io.of('/admin');
io.of('/members');
socketService.init(io);

const start = async () => {
  try {
    await connectDb();
    
    await seedAdmin();

    server.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

start();

export { server, io };
