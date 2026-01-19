// src/socket.js
import { io } from "socket.io-client";

export const socket = io(
  process.env.REACT_APP_SOCKET_URL || "http://localhost:3011",
  {
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelayMax: 10000,
    autoConnect: false,   // No conectamos al importar
    forceNew: false
  }
);
