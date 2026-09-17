import { io } from "socket.io-client";

// Backend URL jahan socket server chal raha hai
const BACKEND_URL = "http://localhost:5000"; 

// Socket client instance initialize karna
export const socket = io(BACKEND_URL, {
  autoConnect: true, // Auto connect enable rakha hai
  transports: ["websocket"],
});