let ioRef = null;

export function setIo(io) {
  ioRef = io;
}

export function emitToUser(userId, event, payload) {
  if (!ioRef) return;
  ioRef.to(`user:${userId}`).emit(event, payload);
}
