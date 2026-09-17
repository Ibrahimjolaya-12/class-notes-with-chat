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
      default: "", // Sirf groups ke liye naam hoga (jaise "FYP Study Group")
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Group admin ki ID
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
  },
  { timestamps: true },
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
