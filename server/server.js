import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { initSockets } from './sockets/index.js';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientUrl, credentials: true },
});
initSockets(io);

connectDb()
  .then(() => {
    server.listen(env.port, () => {
      console.log(`SewaLink API on ${env.serverUrl}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  });
