import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  subject: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  file: { 
    type: String, 
    required: true 
  }, 
  
  
  semester: { 
    type: Number, 
    required: true,
    min: 1,
    max: 8 
  },

  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  downloads: {
    type: Number,
    default: 0
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true }); 

const Notes = mongoose.model("Notes", notesSchema);
export default Notes;