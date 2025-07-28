
import mongoose from "mongoose";
import { PaymentStatus } from "../utils/types.js";

const billingSchema = new mongoose.Schema({
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contract',
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
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING
    },
    dueDate: {
        type: Date,
        required: true
    },
    paymentDate: {
        type: Date
    },
    paymentMethod: {
        type: String
    },
    transactionId: {
        type: String
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    notes: {
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
billingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create invoice number before saving - we're using async/await properly here
billingSchema.pre('save', async function(next) {
    try {
        // Only generate invoice number if it doesn't exist
        if (this.isNew && !this.invoiceNumber) {
            // Get the current date for year
            const currentYear = new Date().getFullYear();
            
            // Find the latest invoice to get a new count
            const latestInvoice = await mongoose.model("billing")
                .findOne({})
                .sort({ createdAt: -1 });
                
            // Start count at 1 if no invoices exist, otherwise increment from the latest
            let count = 1;
            if (latestInvoice) {
                // Try to extract count from existing invoice numbers
                const lastInvoiceNumber = latestInvoice.invoiceNumber || '';
                const match = lastInvoiceNumber.match(/INV-\d{4}-(\d{4})/);
                if (match && match[1]) {
                    count = parseInt(match[1], 10) + 1;
                }
            }
            
            // Create new invoice number format: INV-YYYY-0001
            this.invoiceNumber = `INV-${currentYear}-${count.toString().padStart(4, '0')}`;
        }
        next();
    } catch (error) {
        console.error("Error generating invoice number:", error);
        next(error);
    }
});

const BillingModel = mongoose.model("billing", billingSchema);

export default BillingModel;
