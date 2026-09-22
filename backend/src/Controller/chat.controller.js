// import ChatRoom from "../Models/ChatRoom.js";
// import { User } from "../Models/Auth.model.js";
// import Message from "../Models/Message.js";
// import Avatar from "../Models/Avatar.Model.js";
// import { uploadOnCloudinary } from "../Utils/Cloudinary.js";

// const attachAvatars = async (users) => {
//   const isArray = Array.isArray(users);
//   const userList = isArray ? users : [users];
//   const userIds = userList.map((u) => u._id || u.id);

//   const avatars = await Avatar.find({ user: { $in: userIds } });
//   const avatarMap = new Map();
//   avatars.forEach((a) => avatarMap.set(a.user.toString(), a.avatarUrl));

//   const result = userList.map((u) => {
//     const plainUser = u.toObject ? u.toObject() : { ...u };
//     plainUser.avatar = avatarMap.get(plainUser._id.toString()) || plainUser.avatarUrl || plainUser.profilePic || "";
//     return plainUser;
//   });

//   return isArray ? result : result[0];
// };

// // 1. Search Users
// export const searchUser = async (req, res) => {
//   try {
//     const { query } = req.query;
//     const myId = req.user?._id || req.user?.id;
//     if (!query) return res.status(400).json({ success: false, message: "Query required" });

//     const users = await User.find({
//       _id: { $ne: myId },
//       $or: [
//         { email: { $regex: query, $options: "i" } },
//         { name: { $regex: query, $options: "i" } },
//         { agNumber: { $regex: query, $options: "i" } }
//       ]
//     }).select("name email agNumber semester");

//     const usersWithAvatars = await attachAvatars(users);
//     return res.status(200).json({ success: true, users: usersWithAvatars });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 2. Access / Create Direct Chat (Unhide if hidden previously)
// export const accessDirectChat = async (req, res) => {
//   try {
//     const { recipientId } = req.body;
//     const myId = req.user?._id || req.user?.id;
//     if (!recipientId) return res.status(400).json({ success: false, message: "Recipient required" });

//     let chatRoom = await ChatRoom.findOne({
//       type: "direct",
//       participants: { $all: [myId, recipientId] }
//     }).populate("participants", "name email agNumber semester");

//     if (!chatRoom) {
//       chatRoom = await ChatRoom.create({ type: "direct", participants: [myId, recipientId] });
//       chatRoom = await ChatRoom.findById(chatRoom._id).populate("participants", "name email agNumber semester");
//     } else {
//       // Agar pehle hide ki thi, toh naya message ya access karne par unhide kar do
//       if (chatRoom.hiddenFor && chatRoom.hiddenFor.includes(myId)) {
//         chatRoom.hiddenFor = chatRoom.hiddenFor.filter(id => String(id) !== String(myId));
//         await chatRoom.save();
//       }
//     }

//     const populatedParticipants = await attachAvatars(chatRoom.participants);
//     const responseRoom = chatRoom.toObject();
//     responseRoom.participants = populatedParticipants;

//     return res.status(200).json({ success: true, chatRoom: responseRoom });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 3. Get User Chats (Excluding chats hidden by current user)
// export const getUserChats = async (req, res) => {
//   try {
//     const myId = req.user?._id || req.user?.id;
//     const chats = await ChatRoom.find({
//       participants: myId,
//       hiddenFor: { $ne: myId } // 👈 Jo chats is user ne hide ki hain woh list mein nahi aayengi
//     })
//       .populate("participants", "name email agNumber semester")
//       .sort({ updatedAt: -1 });

//     const formattedChats = await Promise.all(
//       chats.map(async (chat) => {
//         const plainChat = chat.toObject();
//         plainChat.participants = await attachAvatars(plainChat.participants);

//         const lastMsg = await Message.findOne({ chatRoom: chat._id }).sort({ createdAt: -1 });
//         plainChat.lastMessage = lastMsg ? (lastMsg.messageType === "image" ? "📷 Photo" : lastMsg.messageType === "pdf" ? "📄 PDF Document" : lastMsg.text) : "";
//         plainChat.lastMessageTime = lastMsg ? lastMsg.createdAt : chat.updatedAt;

//         const unreadCount = await Message.countDocuments({
//           chatRoom: chat._id,
//           sender: { $ne: myId },
//           isRead: false
//         });
//         plainChat.unreadCount = unreadCount;

//         return plainChat;
//       })
//     );

//     return res.status(200).json({ success: true, chats: formattedChats });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 4. Hide / Delete Chat for Me (WhatsApp style)
// export const hideChat = async (req, res) => {
//   try {
//     const { chatRoomId } = req.params;
//     const myId = req.user?._id || req.user?.id;

//     const chatRoom = await ChatRoom.findById(chatRoomId);
//     if (!chatRoom) return res.status(404).json({ success: false, message: "Chat room not found" });

//     // Add user to hiddenFor array if not already present
//     if (!chatRoom.hiddenFor.includes(myId)) {
//       chatRoom.hiddenFor.push(myId);
//       await chatRoom.save();
//     }

//     return res.status(200).json({ success: true, message: "Chat deleted for you" });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 5. Get Chat Messages
// export const getChatMessages = async (req, res) => {
//   try {
//     const { chatRoomId } = req.params;
//     const myId = req.user?._id || req.user?.id;

//     const messages = await Message.find({ chatRoom: chatRoomId })
//       .populate("sender", "name email agNumber semester")
//       .sort({ createdAt: 1 });

//     await Message.updateMany(
//       { chatRoom: chatRoomId, sender: { $ne: myId }, isRead: false },
//       { $set: { isRead: true } }
//     );

//     const formattedMessages = await Promise.all(
//       messages.map(async (msg) => {
//         const plain = msg.toObject();
//         if (plain.sender) {
//           plain.sender = await attachAvatars(plain.sender);
//         }
//         return plain;
//       })
//     );

//     return res.status(200).json({ success: true, messages: formattedMessages });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const deleteMessage = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const myId = req.user?._id || req.user?.id;

//     const msg = await Message.findById(messageId);
//     if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

//     if (msg.sender.toString() !== myId.toString()) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     msg.isDeleted = true;
//     msg.text = "This message was deleted";
//     msg.fileUrl = "";
//     msg.reactions = [];
//     await msg.save();

//     return res.status(200).json({ success: true, message: "Message deleted", updatedMessage: msg });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const clearChat = async (req, res) => {
//   try {
//     const { chatRoomId } = req.params;
//     await Message.deleteMany({ chatRoom: chatRoomId });
//     return res.status(200).json({ success: true, message: "Chat cleared successfully" });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const uploadChatFile = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

//     const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
//     if (!cloudinaryResponse?.secure_url) {
//       return res.status(500).json({ success: false, message: "Upload failed" });
//     }

//     return res.status(200).json({
//       success: true,
//       url: cloudinaryResponse.secure_url,
//       format: cloudinaryResponse.format || req.file.mimetype,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };



import ChatRoom from "../Models/ChatRoom.js";
import { User } from "../Models/Auth.model.js";
import Message from "../Models/Message.js";
import Avatar from "../Models/Avatar.Model.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";

const attachAvatars = async (users) => {
  const isArray = Array.isArray(users);
  const userList = isArray ? users : [users];
  const userIds = userList.map((u) => u._id || u.id);

  const avatars = await Avatar.find({ user: { $in: userIds } });
  const avatarMap = new Map();
  avatars.forEach((a) => avatarMap.set(a.user.toString(), a.avatarUrl));

  const result = userList.map((u) => {
    const plainUser = u.toObject ? u.toObject() : { ...u };
    plainUser.avatar = avatarMap.get(plainUser._id.toString()) || plainUser.avatarUrl || plainUser.profilePic || "";
    return plainUser;
  });

  return isArray ? result : result[0];
};

// 1. Search Users (Excluding Private Accounts)
export const searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    const myId = req.user?._id || req.user?.id;
    if (!query) return res.status(400).json({ success: false, message: "Query required" });

    const users = await User.find({
      _id: { $ne: myId },
      isPrivate: { $ne: true }, // 👈 Sirf wahi log aayenge jinhone account private nahi kiya
      $or: [
        { email: { $regex: query,$options: "i" } },
        { name: { $regex: query,$options: "i" } },
        { agNumber: { $regex: query,$options: "i" } }
      ]
    }).select("name email agNumber semester isPrivate");

    const usersWithAvatars = await attachAvatars(users);
    return res.status(200).json({ success: true, users: usersWithAvatars });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Update Privacy Settings
export const updatePrivacy = async (req, res) => {
  try {
    const { isPrivate } = req.body;
    const myId = req.user?._id || req.user?.id;

    const updatedUser = await User.findByIdAndUpdate(
      myId,
      { isPrivate },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: `Account is now ${isPrivate ? "Private" : "Public"}`,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Access / Create Direct Chat (Unhide if hidden previously)
export const accessDirectChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const myId = req.user?._id || req.user?.id;
    if (!recipientId) return res.status(400).json({ success: false, message: "Recipient required" });

    let chatRoom = await ChatRoom.findOne({
      type: "direct",
      participants: { $all: [myId, recipientId] }
    }).populate("participants", "name email agNumber semester");

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({ type: "direct", participants: [myId, recipientId] });
      chatRoom = await ChatRoom.findById(chatRoom._id).populate("participants", "name email agNumber semester");
    } else {
      if (chatRoom.hiddenFor && chatRoom.hiddenFor.includes(myId)) {
        chatRoom.hiddenFor = chatRoom.hiddenFor.filter(id => String(id) !== String(myId));
        await chatRoom.save();
      }
    }

    const populatedParticipants = await attachAvatars(chatRoom.participants);
    const responseRoom = chatRoom.toObject();
    responseRoom.participants = populatedParticipants;

    return res.status(200).json({ success: true, chatRoom: responseRoom });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get User Chats (Excluding chats hidden by current user)
export const getUserChats = async (req, res) => {
  try {
    const myId = req.user?._id || req.user?.id;
    const chats = await ChatRoom.find({
      participants: myId,
      hiddenFor: { $ne: myId }
    })
      .populate("participants", "name email agNumber semester")
      .sort({ updatedAt: -1 });

    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const plainChat = chat.toObject();
        plainChat.participants = await attachAvatars(plainChat.participants);

        const lastMsg = await Message.findOne({ chatRoom: chat._id }).sort({ createdAt: -1 });
        plainChat.lastMessage = lastMsg ? (lastMsg.messageType === "image" ? "📷 Photo" : lastMsg.messageType === "pdf" ? "📄 PDF Document" : lastMsg.text) : "";
        plainChat.lastMessageTime = lastMsg ? lastMsg.createdAt : chat.updatedAt;

        const unreadCount = await Message.countDocuments({
          chatRoom: chat._id,
          sender: { $ne: myId },
          isRead: false
        });
        plainChat.unreadCount = unreadCount;

        return plainChat;
      })
    );

    return res.status(200).json({ success: true, chats: formattedChats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Hide / Delete Chat for Me (WhatsApp style)
export const hideChat = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const myId = req.user?._id || req.user?.id;

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) return res.status(404).json({ success: false, message: "Chat room not found" });

    if (!chatRoom.hiddenFor.includes(myId)) {
      chatRoom.hiddenFor.push(myId);
      await chatRoom.save();
    }

    return res.status(200).json({ success: true, message: "Chat deleted for you" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Get Chat Messages
export const getChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const myId = req.user?._id || req.user?.id;

    const messages = await Message.find({ chatRoom: chatRoomId })
      .populate("sender", "name email agNumber semester")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { chatRoom: chatRoomId, sender: { $ne: myId }, isRead: false },
      { $set: { isRead: true } }
    );

    const formattedMessages = await Promise.all(
      messages.map(async (msg) => {
        const plain = msg.toObject();
        if (plain.sender) {
          plain.sender = await attachAvatars(plain.sender);
        }
        return plain;
      })
    );

    return res.status(200).json({ success: true, messages: formattedMessages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user?._id || req.user?.id;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    if (msg.sender.toString() !== myId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    msg.isDeleted = true;
    msg.text = "This message was deleted";
    msg.fileUrl = "";
    msg.reactions = [];
    await msg.save();

    return res.status(200).json({ success: true, message: "Message deleted", updatedMessage: msg });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    await Message.deleteMany({ chatRoom: chatRoomId });
    return res.status(200).json({ success: true, message: "Chat cleared successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse?.secure_url) {
      return res.status(500).json({ success: false, message: "Upload failed" });
    }

    return res.status(200).json({
      success: true,
      url: cloudinaryResponse.secure_url,
      format: cloudinaryResponse.format || req.file.mimetype,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};