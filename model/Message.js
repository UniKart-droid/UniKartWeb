import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      
      type: String, 
      required: true,
      index: true, 
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

   
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


messageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);