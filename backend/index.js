// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import dotenv from "dotenv";
// import dns from "node:dns";
// import cors from "cors";
// import path from "path";
// import Message from "./src/Models/Message.js";
// import ChatRoom from "./src/Models/ChatRoom.js";
// import Avatar from "./src/Models/Avatar.Model.js";
// import { fileURLToPath } from "url";

// import userRouter from "./src/Routes/Auth.routes.js";
// import subjectRouter from "./src/Routes/Subject.routes.js";
// import todoRouter from "./src/Routes/Todo.routes.js";
// import avatarRouter from "./src/Routes/Avatar.routes.js";
// import notesRouter from "./src/Routes/Notes.routes.js";
// import aiRouter from "./src/Routes/AI.routes.js";
// import quizRouter from "./src/Routes/Quiz.routes.js";
// import chatRoutes from "./src/Routes/Chat.routes.js";
// import connectDB from "./src/Config/db.js";

// dotenv.config();

// if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
//   dns.setServers(["8.8.8.8", "1.1.1.1"]);
// }

// const app = express();
// app.set("trust proxy", 1);

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Fully open and flexible CORS policy for production
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (err) {
//     console.error("Critical DB Middleware Error:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Database connection failed. Retrying instance...",
//       error: err.message,
//     });
//   }
// });

// // Static uploads folder for local/Railway
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "public/temp"), {
//     setHeaders: (res, filePath) => {
//       if (filePath.endsWith(".pdf")) {
//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", "inline");
//       }
//     },
//   })
// );

// // Routes
// app.use("/api/auth", userRouter);
// app.use("/api/subjects", subjectRouter);
// app.use("/api/todos", todoRouter);
// app.use("/api/avatar", avatarRouter);
// app.use("/api/notes", notesRouter);
// app.use("/api/quiz", quizRouter);
// app.use("/api/ai", aiRouter);
// app.use("/api/chats", chatRoutes);

// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "ClassNotes Backend Server is running smoothly on Railway!",
//   });
// });

// const onlineUsers = new Map(); // userId -> socketId

// io.on("connection", (socket) => {
//   console.log(`⚡ User connected via Socket: ${socket.id}`);

//   socket.on("user_online", (userId) => {
//     if (userId) {
//       onlineUsers.set(String(userId), socket.id);
//       io.emit("get_online_users", Array.from(onlineUsers.keys()));
//     }
//   });

//   socket.on("join_room", (chatRoomId) => {
//     socket.join(chatRoomId);
//   });

//   socket.on("send_message", async (data) => {
//     try {
//       const { chatRoomId, message, senderId, fileUrl, messageType } = data;

//       const newMessage = await Message.create({
//         chatRoom: chatRoomId,
//         sender: senderId,
//         text: message,
//         fileUrl: fileUrl || "",
//         messageType: messageType || "text",
//         isRead: false,
//       });

//       const populated = await Message.findById(newMessage._id).populate("sender", "name email");
//       const userAvatar = await Avatar.findOne({ user: senderId });

//       const fullMessage = populated.toObject();
//       if (fullMessage.sender) {
//         fullMessage.sender.avatar = userAvatar?.avatarUrl || "";
//       }

//       io.to(chatRoomId).emit("receive_message", fullMessage);

//       const room = await ChatRoom.findById(chatRoomId);
//       if (room && room.participants) {
//         room.participants.forEach((pId) => {
//           const pIdStr = String(pId);
//           if (pIdStr !== String(senderId)) {
//             const recipientSocketId = onlineUsers.get(pIdStr);
//             if (recipientSocketId) {
//               io.to(recipientSocketId).emit("receive_message", fullMessage);
//             }
//           }
//         });
//       }

//       io.emit("update_chat_sidebar", { chatRoomId, lastMessage: message });
//     } catch (error) {
//       console.error("SOCKET ERROR:", error);
//     }
//   });

//   socket.on("react_message", async ({ chatRoomId, messageId, emoji, userId }) => {
//     try {
//       const msg = await Message.findById(messageId);
//       if (!msg || msg.isDeleted) return;

//       const existingIndex = msg.reactions.findIndex((r) => r.user.toString() === userId.toString());
//       if (existingIndex > -1) {
//         if (msg.reactions[existingIndex].emoji === emoji) {
//           msg.reactions.splice(existingIndex, 1);
//         } else {
//           msg.reactions[existingIndex].emoji = emoji;
//         }
//       } else {
//         msg.reactions.push({ user: userId, emoji });
//       }

//       await msg.save();
//       io.to(chatRoomId).emit("message_reacted", { messageId, reactions: msg.reactions });
//     } catch (err) {
//       console.error("SOCKET REACTION ERROR:", err);
//     }
//   });

//   socket.on("delete_message", (data) => {
//     const { chatRoomId, messageId } = data;
//     io.to(chatRoomId).emit("message_deleted", messageId);
//   });

//   socket.on("clear_chat", (chatRoomId) => {
//     io.to(chatRoomId).emit("chat_cleared", chatRoomId);
//   });

//   socket.on("disconnect", () => {
//     for (let [userId, socketId] of onlineUsers.entries()) {
//       if (socketId === socket.id) {
//         onlineUsers.delete(userId);
//         break;
//       }
//     }
//     io.emit("get_online_users", Array.from(onlineUsers.keys()));
//     console.log(`❌ User disconnected: ${socket.id}`);
//   });
// });

// const port = process.env.PORT || 5000;
// server.listen(port, "0.0.0.0", () => {
//   console.log(`Server & Socket.io running on port ${port}`);
// });

// export default app;






import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import dns from "node:dns";
import cors from "cors";
import path from "path";
import Message from "./src/Models/Message.js";
import ChatRoom from "./src/Models/ChatRoom.js";
import Avatar from "./src/Models/Avatar.Model.js";
import { fileURLToPath } from "url";

import userRouter from "./src/Routes/Auth.routes.js";
import subjectRouter from "./src/Routes/Subject.routes.js";
import todoRouter from "./src/Routes/Todo.routes.js";
import avatarRouter from "./src/Routes/Avatar.routes.js";
import notesRouter from "./src/Routes/Notes.routes.js";
import aiRouter from "./src/Routes/AI.routes.js";
import quizRouter from "./src/Routes/Quiz.routes.js";
import chatRoutes from "./src/Routes/Chat.routes.js";
import connectDB from "./src/Config/db.js";

dotenv.config();

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const app = express();
app.set("trust proxy", 1);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Critical DB Middleware Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed. Retrying instance...",
      error: err.message,
    });
  }
});

app.use(
  "/uploads",
  express.static(path.join(__dirname, "public/temp"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
      }
    },
  })
);

// Routes
app.use("/api/auth", userRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/todos", todoRouter);
app.use("/api/avatar", avatarRouter);
app.use("/api/notes", notesRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/ai", aiRouter);
app.use("/api/chats", chatRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ClassNotes Backend Server is running smoothly on Railway!",
  });
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`⚡ User connected via Socket: ${socket.id}`);

  socket.on("user_online", (userId) => {
    if (userId) {
      onlineUsers.set(String(userId), socket.id);
      io.emit("get_online_users", Array.from(onlineUsers.keys()));
    }
  });

  socket.on("join_room", (chatRoomId) => {
    socket.join(chatRoomId);
  });

  socket.on("send_message", async (data) => {
    try {
      const { chatRoomId, message, senderId, fileUrl, messageType } = data;

      const newMessage = await Message.create({
        chatRoom: chatRoomId,
        sender: senderId,
        text: message,
        fileUrl: fileUrl || "",
        messageType: messageType || "text",
        isRead: false,
      });

      // 👇 Jab naya message aaye, toh chat room ko unhide kar do (taake delete ki hui chat wapas list mein aa jaye)
      await ChatRoom.findByIdAndUpdate(chatRoomId, { $set: { hiddenFor: [] } });

      const populated = await Message.findById(newMessage._id).populate("sender", "name email");
      const userAvatar = await Avatar.findOne({ user: senderId });

      const fullMessage = populated.toObject();
      if (fullMessage.sender) {
        fullMessage.sender.avatar = userAvatar?.avatarUrl || "";
      }

      io.to(chatRoomId).emit("receive_message", fullMessage);

      const room = await ChatRoom.findById(chatRoomId);
      if (room && room.participants) {
        room.participants.forEach((pId) => {
          const pIdStr = String(pId);
          if (pIdStr !== String(senderId)) {
            const recipientSocketId = onlineUsers.get(pIdStr);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit("receive_message", fullMessage);
            }
          }
        });
      }

      io.emit("update_chat_sidebar", { chatRoomId, lastMessage: message });
    } catch (error) {
      console.error("SOCKET ERROR:", error);
    }
  });

  socket.on("react_message", async ({ chatRoomId, messageId, emoji, userId }) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg || msg.isDeleted) return;

      const existingIndex = msg.reactions.findIndex((r) => r.user.toString() === userId.toString());
      if (existingIndex > -1) {
        if (msg.reactions[existingIndex].emoji === emoji) {
          msg.reactions.splice(existingIndex, 1);
        } else {
          msg.reactions[existingIndex].emoji = emoji;
        }
      } else {
        msg.reactions.push({ user: userId, emoji });
      }

      await msg.save();
      io.to(chatRoomId).emit("message_reacted", { messageId, reactions: msg.reactions });
    } catch (err) {
      console.error("SOCKET REACTION ERROR:", err);
    }
  });

  socket.on("delete_message", (data) => {
    const { chatRoomId, messageId } = data;
    io.to(chatRoomId).emit("message_deleted", messageId);
  });

  socket.on("clear_chat", (chatRoomId) => {
    io.to(chatRoomId).emit("chat_cleared", chatRoomId);
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("get_online_users", Array.from(onlineUsers.keys()));
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server & Socket.io running on port ${port}`);
});

export default app;