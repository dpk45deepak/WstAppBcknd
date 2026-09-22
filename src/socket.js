import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://wstapp.netlify.app"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ WebSocket client connected: ${socket.id}`);

    // Join room for specific pickup updates
    socket.on('join:pickup', (pickupId) => {
      if (pickupId) {
        socket.join(`pickup:${pickupId}`);
        console.log(`Socket ${socket.id} joined room pickup:${pickupId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`⚡ WebSocket client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const emitPickupUpdate = (pickup) => {
  if (!io) return;
  const pickupData = pickup.toJSON ? pickup.toJSON() : pickup;
  const pickupId = pickupData.id || pickupData._id;

  // Broadcast to all connected clients
  io.emit('pickup:update', pickupData);

  // Broadcast to specific room if joined
  if (pickupId) {
    io.to(`pickup:${pickupId}`).emit('pickup:update', pickupData);
  }
};

export default {
  initSocket,
  getIO,
  emitPickupUpdate
};
