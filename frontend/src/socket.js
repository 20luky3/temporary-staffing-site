import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
let socket = null;

export function connectSocket(token) {
  socket = io(backendUrl, { auth: { token } });
  console.log(socket);
  console.log("You are now connected!!!")

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
