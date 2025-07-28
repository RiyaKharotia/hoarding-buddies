
import AssignmentModel from "../models/assignment.js";
import UserModel from "../models/user.js";
import PhotographerModel from "../models/photographer.js";
import HoardingModel from "../models/hoarding.js";
import { AssignmentStatus } from "../utils/types.js";
import mongoose from "mongoose";

class AssignmentController {
    static createAssignment = async (req, res) => {
        try {
            const { hoardingId, photographerId, dueDate, notes } = req.body;
            
            if (!hoardingId || !photographerId || !dueDate) {
                return res.error(400, "Missing required fields");
            }
            
            // Verify hoarding exists
            const hoarding = await HoardingModel.findById(hoardingId);
            if (!hoarding) {
                return res.error(404, "Hoarding not found");
            }
            
            // Verify photographer exists
            // First check if the ID corresponds to a user with photographer role
            const photographerUser = await UserModel.findOne({ 
                _id: photographerId, 
                role: 'photographer' 
            });

            // If no user is found, check if it's a photographer document ID
            if (!photographerUser) {
                const photographer = await PhotographerModel.findById(photographerId);
                
                // If it's a photographer document, get the associated user
                if (photographer) {
                    const user = await UserModel.findById(photographer.uid);
                    if (!user || user.role !== 'photographer') {
                        return res.error(404, "Photographer not found or invalid");
                    }
                } else {
                    return res.error(404, "Photographer not found");
                }
            }
            
            // Only owner can create assignments
            if (req.user.role !== 'owner') {
                return res.error(403, "Only owners can create assignments");
            }
            
            // Create assignment
            const assignment = new AssignmentModel({
                hoarding: hoardingId,
                photographer: photographerId,
                assignedBy: req.user._id,
                dueDate,
                notes,
                status: AssignmentStatus.ASSIGNED
            });
            
            await assignment.save();
            
            return res.success(201, "Assignment created successfully", assignment);
        } catch (err) {
            console.error("Create assignment error:", err);
            return res.error(500, "Failed to create assignment", err.message);
        }
    };
    
    static getAssignments = async (req, res) => {
        try {
            const { status, photographerId, hoardingId, id } = req.query;
            
            // Build query filters
            const filter = {};
            
            if (status) filter.status = status;
            if (hoardingId) filter.hoarding = hoardingId;
            
            // If specific assignment ID is requested
            if (id) {
                filter._id = id;
            }
            
            // Filter by photographer or assigned by based on user role
            if (req.user.role === 'photographer') {
                filter.photographer = req.user._id;
            } else if (req.user.role === 'owner') {
                if (photographerId) filter.photographer = photographerId;
                filter.assignedBy = req.user._id;
            } else {
                return res.error(403, "You don't have permission to view assignments");
            }
            
            const assignments = await AssignmentModel.find(filter)
                .populate('hoarding', 'name location images')
                .populate('photographer', 'name email avatar')
                .populate('assignedBy', 'name email')
                .sort({ dueDate: 1 });
                
            return res.success(200, "Assignments fetched successfully", assignments);
        } catch (err) {
            console.error("Get assignments error:", err);
            return res.error(500, "Failed to fetch assignments", err.message);
        }
    };
    
    static getAssignmentById = async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.error(400, "Invalid assignment ID format");
            }
            
            const assignment = await AssignmentModel.findById(id)
                .populate('hoarding', 'name location images')
                .populate('photographer', 'name email avatar')
                .populate('assignedBy', 'name email');
                
            if (!assignment) {
                return res.error(404, "Assignment not found");
            }
            
            // Check if user has access to the assignment
            if (req.user.role === 'photographer' && 
                assignment.photographer._id.toString() !== req.user._id.toString()) {
                return res.error(403, "This assignment doesn't belong to you");
            } else if (req.user.role === 'owner' && 
                       assignment.assignedBy._id.toString() !== req.user._id.toString()) {
                return res.error(403, "You didn't create this assignment");
            }
            
            return res.success(200, "Assignment fetched successfully", assignment);
        } catch (err) {
            console.error("Get assignment error:", err);
            return res.error(500, "Failed to fetch assignment", err.message);
        }
    };
    
    static updateAssignmentStatus = async (req, res) => {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            
            if (!status) {
                return res.error(400, "Status is required");
            }
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.error(400, "Invalid assignment ID format");
            }
            
            const assignment = await AssignmentModel.findById(id);
            if (!assignment) {
                return res.error(404, "Assignment not found");
            }
            
            // Validate status update permissions
            if (req.user.role === 'photographer') {
                // Photographers can only update their own assignments and to limited statuses
                if (assignment.photographer.toString() !== req.user._id.toString()) {
                    return res.error(403, "This assignment doesn't belong to you");
                }
                
                if (!['in_progress', 'completed'].includes(status)) {
                    return res.error(400, "Photographers can only mark assignments as in progress or completed");
                }
            } else if (req.user.role === 'owner') {
                // Owners can update any status for assignments they created
                if (assignment.assignedBy.toString() !== req.user._id.toString()) {
                    return res.error(403, "You didn't create this assignment");
                }
            } else {
                return res.error(403, "You don't have permission to update assignments");
            }
            
            // Update assignment
            assignment.status = status;
            if (notes) assignment.notes = notes;
            
            await assignment.save();
            
            return res.success(200, "Assignment updated successfully", assignment);
        } catch (err) {
            console.error("Update assignment error:", err);
            return res.error(500, "Failed to update assignment", err.message);
        }
    };
    
    static deleteAssignment = async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.error(400, "Invalid assignment ID format");
            }
            
            const assignment = await AssignmentModel.findById(id);
            if (!assignment) {
                return res.error(404, "Assignment not found");
            }
            
            // Only owners who created the assignment can delete it
            if (req.user.role !== 'owner' || 
                assignment.assignedBy.toString() !== req.user._id.toString()) {
                return res.error(403, "You don't have permission to delete this assignment");
            }
            
            await AssignmentModel.findByIdAndDelete(id);
            
            return res.success(200, "Assignment deleted successfully");
        } catch (err) {
            console.error("Delete assignment error:", err);
            return res.error(500, "Failed to delete assignment", err.message);
        }
    };
    
    static getPhotographerStats = async (req, res) => {
        try {
            if (req.user.role !== 'photographer') {
                return res.error(403, "Only photographers can access their stats");
            }
            
            // Get assignments count
            const assignedCount = await AssignmentModel.countDocuments({ 
                photographer: req.user._id, 
                status: 'assigned' 
            });
            
            const inProgressCount = await AssignmentModel.countDocuments({ 
                photographer: req.user._id, 
                status: 'in_progress' 
            });
            
            const completedCount = await AssignmentModel.countDocuments({ 
                photographer: req.user._id, 
                status: 'completed' 
            });
            
            // Count upcoming due dates (next 48 hours)
            const now = new Date();
            const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);
            
            const dueSoonCount = await AssignmentModel.countDocuments({
                photographer: req.user._id,
                status: { $in: ['assigned', 'in_progress'] },
                dueDate: { $gte: now, $lte: fortyEightHoursLater }
            });
            
            // Get unique locations
            const assignments = await AssignmentModel.find({ photographer: req.user._id })
                .populate('hoarding', 'location');
                
            const locations = [...new Set(assignments.map(a => 
                a.hoarding?.location?.city || 'Unknown'
            ))].length;
            
            // Get photo stats
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            
            // Format date range for MongoDB query (start of month to now)
            const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
            
            const stats = {
                assignedHoardings: assignedCount + inProgressCount,
                locations,
                photosUploaded: completedCount,
                thisMonth: await AssignmentModel.countDocuments({
                    photographer: req.user._id,
                    updatedAt: { $gte: startOfMonth, $lte: now },
                    status: 'completed'
                }),
                pendingUploads: assignedCount + inProgressCount,
                dueSoon: dueSoonCount,
                imageQualityScore: 4.2, // Placeholder, would need actual quality assessment
                lastFiftyUploads: 0 // Placeholder, would need to track upload trends
            };
            
            return res.success(200, "Photographer stats fetched successfully", stats);
        } catch (err) {
            console.error("Get photographer stats error:", err);
            return res.error(500, "Failed to fetch photographer stats", err.message);
        }
    };
}

export default AssignmentController;
