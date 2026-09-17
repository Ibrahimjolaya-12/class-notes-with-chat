import ChatRoom from "../Models/ChatRoom.js";
import { User } from "../Models/Auth.model.js";
import Message from "../Models/Message.js";
import Avatar from "../Models/Avatar.Model.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";

// Helper: User ke sath Avatar Collection se URL link karna
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

// 1. Search Users
export const searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    const myId = req.user?._id || req.user?.id;
    if (!query) return res.status(400).json({ success: false, message: "Query required" });

    const users = await User.find({
      _id: { $ne: myId },
      $or: [{ email: { $regex: query, $options: "i" } }, { name: { $regex: query, $options: "i" } }]
    }).select("name email semester");

    const usersWithAvatars = await attachAvatars(users);
    return res.status(200).json({ success: true, users: usersWithAvatars });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Access / Create Direct Chat
export const accessDirectChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const myId = req.user?._id || req.user?.id;
    if (!recipientId) return res.status(400).json({ success: false, message: "Recipient required" });

    // 👈 "name email semester" select kiya yahan
    let chatRoom = await ChatRoom.findOne({
      type: "direct",
      participants: { $all: [myId, recipientId] }
    }).populate("participants", "name email semester");

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({ type: "direct", participants: [myId, recipientId] });
      chatRoom = await ChatRoom.findById(chatRoom._id).populate("participants", "name email semester");
    }

    const populatedParticipants = await attachAvatars(chatRoom.participants);
    const responseRoom = chatRoom.toObject();
    responseRoom.participants = populatedParticipants;

    return res.status(200).json({ success: true, chatRoom: responseRoom });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get User Chats (With Last Message Time, Unread Counts, Avatars & Semester)
export const getUserChats = async (req, res) => {
  try {
    const myId = req.user?._id || req.user?.id;
    // 👈 "name email semester" select kiya yahan bhi
    const chats = await ChatRoom.find({ participants: myId })
      .populate("participants", "name email semester")
      .sort({ updatedAt: -1 });

    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const plainChat = chat.toObject();
        plainChat.participants = await attachAvatars(plainChat.participants);

        // Last message & time fetch
        const lastMsg = await Message.findOne({ chatRoom: chat._id }).sort({ createdAt: -1 });
        plainChat.lastMessage = lastMsg ? (lastMsg.messageType === "image" ? "📷 Photo" : lastMsg.messageType === "pdf" ? "📄 PDF Document" : lastMsg.text) : "";
        plainChat.lastMessageTime = lastMsg ? lastMsg.createdAt : chat.updatedAt;

        // Count unread messages (sender != myId)
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

// 4. Get Chat Messages
export const getChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const myId = req.user?._id || req.user?.id;

    // 👈 Sender ke andar bhi semester add kar diya
    const messages = await Message.find({ chatRoom: chatRoomId })
      .populate("sender", "name email semester")
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

// 5. Delete Message Controller
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

// Clear all messages in room
export const clearChat = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    await Message.deleteMany({ chatRoom: chatRoomId });
    return res.status(200).json({ success: true, message: "Chat cleared successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Upload Chat File
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