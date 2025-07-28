import HoardingModel from "../models/hoarding.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = path.join(__dirname, "../uploads/hoardings");

// Ensure upload directory exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

class HoardingController {
    static storage = multer.diskStorage({
        destination: uploadFolder,
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const fileExtension = path.extname(file.originalname);
            const fileName = `hoarding-${timestamp}${fileExtension}`;
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
        storage: HoardingController.storage,
        fileFilter: HoardingController.fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });

    static createHoarding = async (req, res) => {
        try {
            const { name, location, size, dailyRate, status } = req.body;
            
            // Validate required fields
            if (!name || !location || !size || !dailyRate) {
                return res.error(400, "Missing required fields");
            }
            
            // Parse location and size from JSON strings if needed
            const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
            const parsedSize = typeof size === 'string' ? JSON.parse(size) : size;
            
            // Create new hoarding
            const hoarding = new HoardingModel({
                name,
                location: parsedLocation,
                size: parsedSize,
                dailyRate,
                status,
                owner: req.user._id,
                images: req.files ? req.files.map(file => `/uploads/hoardings/${file.filename}`) : []
            });
            
            await hoarding.save();
            
            return res.success(201, "Hoarding created successfully", hoarding);
        } catch (err) {
            console.error("Create hoarding error:", err);
            return res.error(500, "Failed to create hoarding", err.message);
        }
    };
    
    static getAllHoardings = async (req, res) => {
        try {
            const { status, city, priceMin, priceMax } = req.query;
            
            // Build query filters
            const filter = {};
            
            if (status) filter.status = status;
            if (city) filter['location.city'] = { $regex: city, $options: 'i' };
            
            // Price range filter
            if (priceMin !== undefined || priceMax !== undefined) {
                filter.dailyRate = {};
                if (priceMin !== undefined) filter.dailyRate.$gte = Number(priceMin);
                if (priceMax !== undefined) filter.dailyRate.$lte = Number(priceMax);
            }
            
            // For non-owner users, only show active hoardings
            if (req.user.role !== 'owner') {
                filter.status = 'active';
            }
            
            const hoardings = await HoardingModel.find(filter)
                .populate('owner', 'name email')
                .sort({ createdAt: -1 });
                
            return res.success(200, "Hoardings fetched successfully", hoardings);
        } catch (err) {
            console.error("Get hoardings error:", err);
            return res.error(500, "Failed to fetch hoardings", err.message);
        }
    };
    
    static getHoardingById = async (req, res) => {
        try {
            const { id } = req.params;
            
            const hoarding = await HoardingModel.findById(id)
                .populate('owner', 'name email');
                
            if (!hoarding) {
                return res.error(404, "Hoarding not found");
            }
            
            // If user is not owner and hoarding is not active
            if (req.user.role !== 'owner' && 
                hoarding.owner._id.toString() !== req.user._id.toString() && 
                hoarding.status !== 'active') {
                return res.error(403, "You don't have access to this hoarding");
            }
            
            return res.success(200, "Hoarding fetched successfully", hoarding);
        } catch (err) {
            console.error("Get hoarding error:", err);
            return res.error(500, "Failed to fetch hoarding", err.message);
        }
    };
    
    static updateHoarding = async (req, res) => {
        try {
            const { id } = req.params;
            const { name, location, size, dailyRate, status } = req.body;
            
            const hoarding = await HoardingModel.findById(id);
            
            if (!hoarding) {
                return res.error(404, "Hoarding not found");
            }
            
            // Check if user is owner
            if (req.user.role !== 'owner' || hoarding.owner.toString() !== req.user._id.toString()) {
                return res.error(403, "You don't have permission to update this hoarding");
            }
            
            // Update fields
            if (name) hoarding.name = name;
            if (location) {
                const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
                hoarding.location = parsedLocation;
            }
            if (size) {
                const parsedSize = typeof size === 'string' ? JSON.parse(size) : size;
                hoarding.size = parsedSize;
            }
            if (dailyRate) hoarding.dailyRate = dailyRate;
            if (status) hoarding.status = status;
            
            // Add new images if uploaded
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => `/uploads/hoardings/${file.filename}`);
                hoarding.images = [...hoarding.images, ...newImages];
            }
            
            await hoarding.save();
            
            return res.success(200, "Hoarding updated successfully", hoarding);
        } catch (err) {
            console.error("Update hoarding error:", err);
            return res.error(500, "Failed to update hoarding", err.message);
        }
    };
    
    static deleteHoarding = async (req, res) => {
        try {
            const { id } = req.params;
            
            const hoarding = await HoardingModel.findById(id);
            
            if (!hoarding) {
                return res.error(404, "Hoarding not found");
            }
            
            // Check if user is owner
            if (req.user.role !== 'owner' || hoarding.owner.toString() !== req.user._id.toString()) {
                return res.error(403, "You don't have permission to delete this hoarding");
            }
            
            // Delete hoarding images from storage
            hoarding.images.forEach(imagePath => {
                const fullPath = path.join(__dirname, '..', imagePath);
                fs.existsSync(fullPath) && fs.unlinkSync(fullPath);
            });
            
            await HoardingModel.findByIdAndDelete(id);
            
            return res.success(200, "Hoarding deleted successfully");
        } catch (err) {
            console.error("Delete hoarding error:", err);
            return res.error(500, "Failed to delete hoarding", err.message);
        }
    };
    
    static removeHoardingImage = async (req, res) => {
        try {
            const { id } = req.params;
            const { imagePath } = req.body;
            
            const hoarding = await HoardingModel.findById(id);
            
            if (!hoarding) {
                return res.error(404, "Hoarding not found");
            }
            
            // Check if user is owner
            if (req.user.role !== 'owner' || hoarding.owner.toString() !== req.user._id.toString()) {
                return res.error(403, "You don't have permission to update this hoarding");
            }
            
            // Check if image exists in hoarding
            if (!hoarding.images.includes(imagePath)) {
                return res.error(404, "Image not found in hoarding");
            }
            
            // Remove image from storage
            const fullPath = path.join(__dirname, '..', imagePath);
            fs.existsSync(fullPath) && fs.unlinkSync(fullPath);
            
            // Remove image from hoarding
            hoarding.images = hoarding.images.filter(image => image !== imagePath);
            await hoarding.save();
            
            return res.success(200, "Image removed successfully", hoarding);
        } catch (err) {
            console.error("Remove image error:", err);
            return res.error(500, "Failed to remove image", err.message);
        }
    };
    
    static getHoardingsByStatus = async (req, res) => {
        try {
            const { status } = req.params;
            
            // Validate status
            if (!status) {
                return res.error(400, "Status parameter is required");
            }
            
            // For non-owner users, only allow viewing active hoardings
            if (req.user.role !== 'owner' && status !== 'active') {
                return res.error(403, "You don't have permission to view hoardings with this status");
            }
            
            const hoardings = await HoardingModel.find({ status })
                .populate('owner', 'name email')
                .sort({ createdAt: -1 });
                
            return res.success(200, "Hoardings fetched successfully", hoardings);
        } catch (err) {
            console.error("Get hoardings by status error:", err);
            return res.error(500, "Failed to fetch hoardings", err.message);
        }
    };
    
    static getHoardingsByLocation = async (req, res) => {
        try {
            const { city } = req.params;
            
            // Validate city
            if (!city) {
                return res.error(400, "City parameter is required");
            }
            
            // Build query
            const query = { 'location.city': { $regex: city, $options: 'i' } };
            
            // For non-owner users, only show active hoardings
            if (req.user.role !== 'owner') {
                query.status = 'active';
            }
            
            const hoardings = await HoardingModel.find(query)
                .populate('owner', 'name email')
                .sort({ createdAt: -1 });
                
            return res.success(200, "Hoardings fetched successfully", hoardings);
        } catch (err) {
            console.error("Get hoardings by location error:", err);
            return res.error(500, "Failed to fetch hoardings", err.message);
        }
    };
}

export default HoardingController;
