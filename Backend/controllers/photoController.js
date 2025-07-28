
import PhotoModel from "../models/photo.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PhotoStatus } from "../utils/types.js";

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = path.join(__dirname, "../uploads/photos");

// Ensure upload directory exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

class PhotoController {
    static storage = multer.diskStorage({
        destination: uploadFolder,
        filename: (req, file, cb) => {
            const timestamp = Date.now();
            const fileExtension = path.extname(file.originalname);
            const fileName = `photo-${timestamp}${fileExtension}`;
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
        storage: PhotoController.storage,
        fileFilter: PhotoController.fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });

    static createPhoto = async (req, res) => {
        try {
            const { hoarding, assignment, caption } = req.body;
            
            if (!hoarding || !req.file) {
                return res.error(400, "Missing required fields");
            }
            
            // Create new photo entry
            const photo = new PhotoModel({
                fileName: req.file.filename,
                filePath: `/uploads/photos/${req.file.filename}`,
                hoarding,
                uploadedBy: req.user._id,
                assignment,
                caption,
                metadata: {
                    size: req.file.size,
                    format: path.extname(req.file.originalname).substring(1)
                }
            });
            
            await photo.save();
            
            return res.success(201, "Photo uploaded successfully", photo);
        } catch (err) {
            console.error("Create photo error:", err);
            return res.error(500, "Failed to upload photo", err.message);
        }
    };
    
    static getAllPhotos = async (req, res) => {
        try {
            const { status, hoardingId } = req.query;
            
            // Build query filters
            const filter = {};
            
            if (status) filter.status = status;
            if (hoardingId) filter.hoarding = hoardingId;
            
            // Filter based on user role
            if (req.user.role === 'photographer') {
                filter.uploadedBy = req.user._id;
            }
            
            const photos = await PhotoModel.find(filter)
                .populate('hoarding', 'name location')
                .populate('uploadedBy', 'name email')
                .populate('assignment', 'dueDate notes')
                .sort({ createdAt: -1 });
                
            return res.success(200, "Photos fetched successfully", photos);
        } catch (err) {
            console.error("Get photos error:", err);
            return res.error(500, "Failed to fetch photos", err.message);
        }
    };
    
    static getPhotoById = async (req, res) => {
        try {
            const { id } = req.params;
            
            const photo = await PhotoModel.findById(id)
                .populate('hoarding', 'name location')
                .populate('uploadedBy', 'name email')
                .populate('assignment', 'dueDate notes');
                
            if (!photo) {
                return res.error(404, "Photo not found");
            }
            
            return res.success(200, "Photo fetched successfully", photo);
        } catch (err) {
            console.error("Get photo error:", err);
            return res.error(500, "Failed to fetch photo", err.message);
        }
    };
    
    static updatePhoto = async (req, res) => {
        try {
            const { id } = req.params;
            const { caption, status } = req.body;
            
            const photo = await PhotoModel.findById(id);
            
            if (!photo) {
                return res.error(404, "Photo not found");
            }
            
            // Check permissions
            if (req.user.role === 'photographer' && 
                photo.uploadedBy.toString() !== req.user._id.toString()) {
                return res.error(403, "You don't have permission to update this photo");
            }
            
            // Update fields
            if (caption) photo.caption = caption;
            if (status && req.user.role === 'owner') photo.status = status;
            
            await photo.save();
            
            return res.success(200, "Photo updated successfully", photo);
        } catch (err) {
            console.error("Update photo error:", err);
            return res.error(500, "Failed to update photo", err.message);
        }
    };
    
    static deletePhoto = async (req, res) => {
        try {
            const { id } = req.params;
            
            const photo = await PhotoModel.findById(id);
            
            if (!photo) {
                return res.error(404, "Photo not found");
            }
            
            // Check permissions
            if (req.user.role === 'photographer' && 
                photo.uploadedBy.toString() !== req.user._id.toString()) {
                return res.error(403, "You don't have permission to delete this photo");
            }
            
            // Delete photo from storage
            const fullPath = path.join(__dirname, '..', photo.filePath);
            fs.existsSync(fullPath) && fs.unlinkSync(fullPath);
            
            await PhotoModel.findByIdAndDelete(id);
            
            return res.success(200, "Photo deleted successfully");
        } catch (err) {
            console.error("Delete photo error:", err);
            return res.error(500, "Failed to delete photo", err.message);
        }
    };
    
    static getPhotosByHoarding = async (req, res) => {
        try {
            const { hoardingId } = req.params;
            
            const photos = await PhotoModel.find({ hoarding: hoardingId })
                .populate('uploadedBy', 'name email')
                .populate('assignment', 'dueDate notes')
                .sort({ createdAt: -1 });
                
            return res.success(200, "Photos fetched successfully", photos);
        } catch (err) {
            console.error("Get photos by hoarding error:", err);
            return res.error(500, "Failed to fetch photos", err.message);
        }
    };
    
    static getPhotosByAssignment = async (req, res) => {
        try {
            const { assignmentId } = req.params;
            
            const photos = await PhotoModel.find({ assignment: assignmentId })
                .populate('hoarding', 'name location')
                .populate('uploadedBy', 'name email')
                .sort({ createdAt: -1 });
                
            return res.success(200, "Photos fetched successfully", photos);
        } catch (err) {
            console.error("Get photos by assignment error:", err);
            return res.error(500, "Failed to fetch photos", err.message);
        }
    };
}

export default PhotoController;
