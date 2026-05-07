import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Notice description is required"],
      trim: true,
    },
    
    pdfUrl: {
      type: String,
      default: null,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    expiryDate: {
      type: Date,
    },
  },
  {
    
    timestamps: true,
  }
);


noticeSchema.index({ title: "text" });

const Notice = mongoose.model("Notice", noticeSchema);

export default Notice; 