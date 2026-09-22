// import express from "express";
// import auth from "../Middlewares/Auth.middleware.js";
// import { 
//   accessDirectChat, 
//   clearChat, 
//   deleteMessage, 
//   getChatMessages, 
//   getUserChats, 
//   searchUser, 
//   uploadChatFile, 
//   hideChat 
// } from "../Controller/chat.controller.js";
// import { upload } from "../Middlewares/Multer.middleware.js";

// const router = express.Router()

// router.get("/search", auth, searchUser);
// router.post("/direct", auth, accessDirectChat);
// router.get("/my-chats", auth, getUserChats);
// router.get("/messages/:chatRoomId", auth, getChatMessages);
// router.post("/upload", auth, upload.single("file"), uploadChatFile);
// router.delete("/messages/:messageId", auth, deleteMessage);
// router.delete("/clear/:chatRoomId", auth, clearChat);
// router.delete("/room/:chatRoomId", auth, hideChat);

// export default router;



import express from "express";
import auth from "../Middlewares/Auth.middleware.js";
import { 
  accessDirectChat, 
  clearChat, 
  deleteMessage, 
  getChatMessages, 
  getUserChats, 
  searchUser, 
  uploadChatFile, 
  hideChat,
  updatePrivacy 
} from "../Controller/chat.controller.js";
import { upload } from "../Middlewares/Multer.middleware.js";

const router = express.Router()

router.get("/search", auth, searchUser);
router.post("/direct", auth, accessDirectChat);
router.get("/my-chats", auth, getUserChats);
router.get("/messages/:chatRoomId", auth, getChatMessages);
router.post("/upload", auth, upload.single("file"), uploadChatFile);
router.delete("/messages/:messageId", auth, deleteMessage);
router.delete("/clear/:chatRoomId", auth, clearChat);
router.delete("/room/:chatRoomId", auth, hideChat);
router.put("/update-privacy", auth, updatePrivacy);

export default router;