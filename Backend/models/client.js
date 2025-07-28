
import mongoose from "mongoose";
import { ClientStatus } from "../utils/types.js";

const clientSchema = new mongoose.Schema({
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    contactPerson: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(ClientStatus),
        default: ClientStatus.ACTIVE
    },
    hoardingsCount: {
        type: Number,
        default: 0
    },
    contractsCount: {
        type: Number,
        default: 0
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
clientSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const ClientModel = mongoose.model("client", clientSchema);

export default ClientModel;
