import { io } from "socket.io-client";

// Backend URL jahan socket server chal raha hai
const BACKEND_URL = "https://class-notes-with-chat-production.up.railway.app"; 

// Socket client instance initialize karna
export const socket = io(BACKEND_URL, {
  autoConnect: true, // Auto connect enable rakha hai
  transports: ["websocket"],
});