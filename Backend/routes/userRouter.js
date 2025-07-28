import express from "express";
import UserController from "../controllers/userController.js";
import UserModel from "../models/user.js";
import { auth } from "../middlewares/auth.js";
import PhotographerModel from "../models/photographer.js";
import ClientModel from "../models/client.js";

const UserRouter = express.Router();

// Get all users (with optional filters)
UserRouter.get("/", auth, async (req, res) => {
    try {
        const { role, search, limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        let query = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await UserModel.countDocuments(query);
        const users = await UserModel.find(query)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit));

        return res.success(200, "Users fetched successfully", {
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        return res.error(500, "Failed to fetch users", error.message);
    }
});

// Get photographers with profiles - updating to match the endpoint used in the frontend
UserRouter.get("/photographers", auth, async (req, res) => {
    try {
        const { search, limit = 20, page = 1, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build photographer query
        let photographerQuery = {};
        if (status) {
            photographerQuery.status = status;
        }

        // Get photographers with user details
        let query = PhotographerModel.find(photographerQuery)
            .populate({
                path: 'uid',
                select: '-password'
            });
            
        // Apply text search to the populated data if search is provided
        if (search) {
            query = PhotographerModel.find(photographerQuery)
                .populate({
                    path: 'uid',
                    match: {
                        $or: [
                            { name: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } }
                        ]
                    },
                    select: '-password'
                });
        }
        
        // Execute the query with pagination
        const photographerProfiles = await query
            .skip(skip)
            .limit(parseInt(limit));

        // Filter out any null populated results from search
        const filtered = photographerProfiles.filter(profile => profile.uid);
        
        // Format the response data
        const photographers = filtered.map(profile => ({
            _id: profile._id,
            uid: profile.uid._id,
            status: profile.status,
            assignedHoardings: profile.assignedHoardings,
            photosUploaded: profile.photosUploaded,
            bio: profile.bio,
            name: profile.uid.name,
            email: profile.uid.email,
            phone: profile.uid.phone,
            location: profile.uid.location,
            avatar: profile.uid.avatar,
            role: profile.uid.role
        }));

        // Count total matching records for pagination
        const total = await PhotographerModel.countDocuments(photographerQuery);

        return res.success(200, "Photographers fetched successfully", {
            photographers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        return res.error(500, "Failed to fetch photographers", error.message);
    }
});

// Get clients with profiles
UserRouter.get("/clients", auth, async (req, res) => {
    try {
        const { search, limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get clients with user details
        const clientProfiles = await ClientModel.find()
            .populate({
                path: 'uid',
                match: search ? {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                } : {},
                select: '-password'
            })
            .skip(skip)
            .limit(parseInt(limit));

        // Filter out any null populated results from search
        const filtered = clientProfiles.filter(profile => profile.uid);

        // Count total matching records for pagination
        const total = await ClientModel.countDocuments({});

        return res.success(200, "Clients fetched successfully", {
            clients: filtered,
            pagination: {
                total: total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        return res.error(500, "Failed to fetch clients", error.message);
    }
});

// Register a new user
UserRouter.post("/register", UserController.upload.single('avatar'), UserController.register);

// Login
UserRouter.post("/login", UserController.login);

// Get user profile
UserRouter.get("/profile", auth, UserController.getUserProfile);

// Update user profile
UserRouter.put("/profile", auth, UserController.upload.single('avatar'), UserController.updateUserProfile);

// Change password
UserRouter.put("/change-password", auth, UserController.changePassword);

// Update user by ID (admin only)
UserRouter.put("/:id", auth, async (req, res) => {
    try {
        // Check if user is an admin/owner
        if (req.user.role !== 'owner') {
            return res.error(403, "Forbidden - Admin access required");
        }

        const { id } = req.params;
        const { name, email, role } = req.body;

        const user = await UserModel.findById(id);
        if (!user) {
            return res.error(404, "User not found");
        }

        if (name) user.name = name;
        if (email) {
            // Check if email already exists for another user
            const existingUser = await UserModel.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.error(409, "Email already in use by another account");
            }
            user.email = email;
        }
        if (role) user.role = role;

        user.updatedAt = Date.now();
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.success(200, "User updated successfully", userResponse);
    } catch (error) {
        return res.error(500, "Failed to update user", error.message);
    }
});

// Get user by ID
UserRouter.get("/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id).select('-password');

        if (!user) {
            return res.error(404, "User not found");
        }

        return res.success(200, "User fetched successfully", user);
    } catch (error) {
        return res.error(500, "Failed to fetch user", error.message);
    }
});

// Delete user (admin only)
UserRouter.delete("/:id", auth, async (req, res) => {
    try {
        // Check if user is an admin/owner
        if (req.user.role !== 'owner') {
            return res.error(403, "Forbidden - Admin access required");
        }

        const { id } = req.params;

        // Prevent deletion of own account
        if (req.user._id.toString() === id) {
            return res.error(400, "Cannot delete your own account");
        }

        const user = await UserModel.findByIdAndDelete(id);
        if (!user) {
            return res.error(404, "User not found");
        }

        return res.success(200, "User deleted successfully");
    } catch (error) {
        return res.error(500, "Failed to delete user", error.message);
    }
});

export default UserRouter;
