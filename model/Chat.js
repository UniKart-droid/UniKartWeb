import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    
    chatId: {
      type: String,
      unique: true,
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastMessage: {
      type: String,
    },

    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);