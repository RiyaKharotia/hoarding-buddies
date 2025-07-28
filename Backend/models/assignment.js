
import mongoose from "mongoose";
import { AssignmentStatus } from "../utils/types.js";

const assignmentSchema = new mongoose.Schema({
    hoarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hoarding',
        required: true
    },
    photographer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: Object.values(AssignmentStatus),
        default: AssignmentStatus.ASSIGNED
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
assignmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const AssignmentModel = mongoose.model("assignment", assignmentSchema);

export default AssignmentModel;
