// src/socket.js
import { io } from "socket.io-client";

export const socket = io(
  import.meta.env.VITE_SOCKET_URL || "http://localhost:3011",
  {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelayMax: 10000,
    autoConnect: false,   // No conectamos al importar
    forceNew: false
  }
);
