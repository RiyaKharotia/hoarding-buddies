import UserModel from "../models/user.js";
import JwtHelper from "../utils/jwtHelper.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = path.join(__dirname, "../uploads/users");

// Ensure upload directory exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

class UserController {
    static storage = multer.diskStorage({
        destination: uploadFolder,
        filename: (req, file, cb) => {
            const userEmail = req.body.email;
            const timestamp = Date.now();
            const fileExtension = path.extname(file.originalname); // Get file extension
            const fileName = `${userEmail}-${timestamp}${fileExtension}`; // e.g., user@gmail.com-1638271284123.jpg
            cb(null, fileName);
        }
    });
    
    static fileFilter = (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    };
    
    static upload = multer({ 
        storage: UserController.storage,
        fileFilter: UserController.fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });

    static register = async (req, res) => {
        const session = await mongoose.startSession();
        try {
            const { name, email, role, password } = req.body;
            
            if (!name || !email || !role || !password) {
                return res.error(400, "Missing required fields", null);
            }

            // Check if user already exists
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.error(409, "User with this email already exists");
            }
            
            session.startTransaction();
            
            // Hash password
            const hashedPassword = await bcryptjs.hash(password, 10);
            
            // Create new user
            const user = new UserModel({
                name,
                email,
                role,
                password: hashedPassword,
                avatar: req.file ? `/uploads/users/${req.file.filename}` : undefined
            });
            
            const data = await user.save({ session });
            
            // Create access token
            const token = JwtHelper.generateAccessToken(data);
            
            // Remove password from response
            const userResponse = data.toObject();
            delete userResponse.password;
            
            await session.commitTransaction();
            return res.success(201, "User registered successfully", {
                user: userResponse,
                token
            });
        } catch (err) {
            await session.abortTransaction();
            console.log("Transaction aborted", err);
            return res.error(500, "Failed to register user", err.message);
        } finally {
            session.endSession();
        }
    };

    static login = async (req, res) => {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.error(400, "Email and password are required");
        }
        
        try {
            // Find user by email
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.error(404, "User not found", null);
            }
            
            // Compare passwords
            const isPasswordValid = await bcryptjs.compare(password, user.password);
            if (!isPasswordValid) {
                return res.error(401, "Invalid credentials", null);
            }
            
            // Create access token
            const token = JwtHelper.generateAccessToken(user);
            
            // Prepare user response without password
            const userResponse = user.toObject();
            delete userResponse.password;
            
            return res.success(200, "Logged in successfully", { 
                user: userResponse,
                token 
            });
        } catch (err) {
            console.error("Login error:", err);
            return res.error(500, "Failed to login", err.message);
        }
    };
    
    static getUserProfile = async (req, res) => {
        try {
            const userId = req.user._id;
            const user = await UserModel.findById(userId).select('-password');
            
            if (!user) {
                return res.error(404, "User not found", null);
            }
            
            return res.success(200, "User profile fetched successfully", user);
        } catch (err) {
            console.error("Get profile error:", err);
            return res.error(500, "Failed to fetch user profile", err.message);
        }
    };
    
    static updateUserProfile = async (req, res) => {
        try {
            const userId = req.user._id;
            const { name, email } = req.body;
            
            // Find user to update
            let user = await UserModel.findById(userId);
            if (!user) {
                return res.error(404, "User not found", null);
            }
            
            // Update fields
            if (name) user.name = name;
            if (email) {
                // Check if email already exists for another user
                const existingUser = await UserModel.findOne({ email, _id: { $ne: userId } });
                if (existingUser) {
                    return res.error(409, "Email already in use by another account");
                }
                user.email = email;
            }
            
            // Update avatar if provided
            if (req.file) {
                // Delete old avatar file if exists and not the default
                if (user.avatar && !user.avatar.includes('default-avatar')) {
                    const oldFilePath = path.join(__dirname, '..', user.avatar);
                    fs.existsSync(oldFilePath) && fs.unlinkSync(oldFilePath);
                }
                
                user.avatar = `/uploads/users/${req.file.filename}`;
            }
            
            user.updatedAt = Date.now();
            await user.save();
            
            // Return updated user without password
            const userResponse = user.toObject();
            delete userResponse.password;
            
            return res.success(200, "User profile updated successfully", userResponse);
        } catch (err) {
            console.error("Update profile error:", err);
            return res.error(500, "Failed to update user profile", err.message);
        }
    };
    
    static changePassword = async (req, res) => {
        try {
            const userId = req.user._id;
            const { currentPassword, newPassword } = req.body;
            
            if (!currentPassword || !newPassword) {
                return res.error(400, "Current password and new password are required");
            }
            
            // Find user
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.error(404, "User not found", null);
            }
            
            // Verify current password
            const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.error(401, "Current password is incorrect");
            }
            
            // Hash and update new password
            const hashedPassword = await bcryptjs.hash(newPassword, 10);
            user.password = hashedPassword;
            user.updatedAt = Date.now();
            
            await user.save();
            
            return res.success(200, "Password changed successfully", null);
        } catch (err) {
            console.error("Change password error:", err);
            return res.error(500, "Failed to change password", err.message);
        }
    };
}

export default UserController;
