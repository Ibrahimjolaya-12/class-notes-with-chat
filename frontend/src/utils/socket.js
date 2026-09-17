import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://class-notes-with-chat-production.up.railway.app"; 

export const socket = io(BACKEND_URL, {
  autoConnect: true,
  transports: ["polling", "websocket"], // 👈 Polling pehle rakho taake Railway connection establish kar sakay
  secure: true,
  rejectUnauthorized: false,
});