import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
      default: "direct",
    },
    name: {
      type: String,
      default: "",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    hiddenFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // 👈 Sahi syntax
  },
  { timestamps: true },
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;