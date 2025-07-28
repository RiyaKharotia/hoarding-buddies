
import mongoose from "mongoose";
import { UserRole } from "../utils/types.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(UserRole),
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
