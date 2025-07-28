
import mongoose from "mongoose";
import { PhotoStatus } from "../utils/types.js";

const photoSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    hoarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hoarding',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assignment'
    },
    takenAt: {
        type: Date,
        default: Date.now
    },
    metadata: {
        width: Number,
        height: Number,
        size: Number,
        format: String
    },
    caption: {
        type: String
    },
    status: {
        type: String,
        enum: Object.values(PhotoStatus),
        default: PhotoStatus.PENDING
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
photoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const PhotoModel = mongoose.model("photo", photoSchema);

export default PhotoModel;
