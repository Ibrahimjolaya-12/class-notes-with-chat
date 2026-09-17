import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    messageType: {
      type: String,
      enum: ["text", "image", "audio", "pdf", "file"],
      default: "text",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false, // 👈 "This message was deleted" ke liye
    },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);