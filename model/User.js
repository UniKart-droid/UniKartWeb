import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    
    required: false, 
    minlength: 2
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    
    required: false, 
    minlength: 6
  },

  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    required: false 
  },

  
  otp: {
    type: String,
  },
  otpExpire: {
    type: Date,
  },

  
  id_card: {
    type: String,
    required: function () {
      return this.role === "student";
    }
  },

  
  teacher_id: {
    type: String,
    required: function () {
      return this.role === "teacher";
    }
  },

  
  admin_id: {
    type: String,
    required: function () {
      return this.role === "admin";
    }
  },

 
  isApproved: {
    type: Boolean,
    default: false
  },

  
  resetPasswordToken: String,
  resetPasswordExpire: Date

}, { timestamps: true });


const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;