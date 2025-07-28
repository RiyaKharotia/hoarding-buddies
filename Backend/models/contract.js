
import mongoose from "mongoose";
import { ContractStatus } from "../utils/types.js";

const contractSchema = new mongoose.Schema({
    contractNumber: {
        type: String,
        unique: true
    },
    hoarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hoarding',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(ContractStatus),
        default: ContractStatus.PENDING
    },
    termsAndConditions: {
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
contractSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate contract number if not provided
contractSchema.pre('save', async function(next) {
    if (this.isNew && !this.contractNumber) {
        const count = await mongoose.model("contract").countDocuments();
        this.contractNumber = `CON-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

const ContractModel = mongoose.model("contract", contractSchema);

export default ContractModel;
