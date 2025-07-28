
import express from "express";
import BillingController from "../controllers/billingController.js";
import { auth } from "../middlewares/auth.js";

const BillingRouter = express.Router();

// Create a new invoice
BillingRouter.post("/invoice", auth, BillingController.createInvoice);

// Get all invoices
BillingRouter.get("/", auth, BillingController.getAllInvoices);

// Get invoice by ID
BillingRouter.get("/invoice/:id", auth, BillingController.getInvoiceById);

// Update invoice status
BillingRouter.put("/invoice/:id", auth, BillingController.updateInvoice);

// Delete invoice
BillingRouter.delete("/invoice/:id", auth, BillingController.deleteInvoice);

// Download invoice as PDF
BillingRouter.get("/invoice/:id/download", auth, BillingController.downloadInvoice);

// Send payment reminder
BillingRouter.post("/invoice/:id/remind", auth, BillingController.sendPaymentReminder);

// Get billing analytics and summary
BillingRouter.get("/analytics", auth, BillingController.getBillingAnalytics);

export default BillingRouter;
