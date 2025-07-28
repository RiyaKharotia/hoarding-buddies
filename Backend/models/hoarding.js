
import mongoose from "mongoose";
import { HoardingStatus } from "../utils/types.js";

const hoardingSchema = new mongoose.Schema({
    hoardingNumber: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            }
        }
    },
    size: {
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            default: 'feet'
        }
    },
    dailyRate: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(HoardingStatus),
        default: HoardingStatus.ACTIVE
    },
    images: [{
        type: String
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
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
hoardingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate hoarding number if not provided
hoardingSchema.pre('save', async function(next) {
    if (this.isNew && !this.hoardingNumber) {
        const count = await mongoose.model("hoarding").countDocuments();
        this.hoardingNumber = `H-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

const HoardingModel = mongoose.model("hoarding", hoardingSchema);

export default HoardingModel;
