
import mongoose from "mongoose";
import { PhotographerStatus } from "../utils/types.js";

const photographerSchema = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: Object.values(PhotographerStatus),
        default: PhotographerStatus.ACTIVE
    },
    assignedHoardings: {
        type: Number,
        default: 0
    },
    photosUploaded: {
        type: Number,
        default: 0
    },
    bio: {
        type: String,
        default: ""
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
photographerSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const PhotographerModel = mongoose.model("photographer", photographerSchema);

export default PhotographerModel;
