
import BillingModel from "../models/billing.js";
import ContractModel from "../models/contract.js";
import { PaymentStatus } from "../utils/types.js";

class BillingController {
  static createInvoice = async (req, res) => {
    try {
      const { contractId, amount, dueDate, notes } = req.body;
      
      if (!contractId || !amount || !dueDate) {
        return res.error(400, "Missing required fields");
      }
      
      // Verify contract exists
      const contract = await ContractModel.findById(contractId);
      if (!contract) {
        return res.error(404, "Contract not found");
      }
      
      // Only owner can create invoices
      if (req.user.role !== 'owner') {
        return res.error(403, "Only owners can create invoices");
      }
      
      // Generate a unique invoice number (year + counter)
      const currentYear = new Date().getFullYear();
      const latestInvoice = await BillingModel.findOne({}).sort({ createdAt: -1 });
      
      let count = 1;
      if (latestInvoice && latestInvoice.invoiceNumber) {
        const match = latestInvoice.invoiceNumber.match(/INV-\d{4}-(\d{4})/);
        if (match && match[1]) {
          count = parseInt(match[1], 10) + 1;
        }
      }
      
      const invoiceNumber = `INV-${currentYear}-${count.toString().padStart(4, '0')}`;
      
      // Create invoice with explicitly set invoice number
      const invoice = new BillingModel({
        contract: contractId,
        client: contract.client,
        owner: req.user._id,
        amount,
        paymentStatus: PaymentStatus.PENDING,
        dueDate,
        notes,
        invoiceNumber // Explicitly setting the invoice number
      });
      
      await invoice.save();
      
      return res.success(201, "Invoice created successfully", invoice);
    } catch (err) {
      console.error("Create invoice error:", err);
      return res.error(500, "Failed to create invoice", err.message);
    }
  };
  
  static getAllInvoices = async (req, res) => {
    try {
      const { status, contractId, clientId } = req.query;
      
      // Build query filters
      const filter = {};
      
      if (status) filter.paymentStatus = status;
      if (contractId) filter.contract = contractId;
      if (clientId) filter.client = clientId;
      
      // Filter by role (owner sees all invoices they created, clients see their invoices)
      if (req.user.role === 'client') {
        filter.client = req.user._id;
      } else if (req.user.role === 'owner') {
        filter.owner = req.user._id;
      } else {
        return res.error(403, "You don't have permission to view invoices");
      }
      
      const invoices = await BillingModel.find(filter)
        .populate('contract', 'startDate endDate contractNumber')
        .populate('client', 'name email phone')
        .populate('owner', 'name email phone')
        .sort({ dueDate: 1 });
        
      return res.success(200, "Invoices fetched successfully", invoices);
    } catch (err) {
      console.error("Get invoices error:", err);
      return res.error(500, "Failed to fetch invoices", err.message);
    }
  };
  
  static getInvoiceById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const invoice = await BillingModel.findById(id)
        .populate('contract', 'startDate endDate totalAmount contractNumber')
        .populate('client', 'name email phone')
        .populate('owner', 'name email phone');
        
      if (!invoice) {
        return res.error(404, "Invoice not found");
      }
      
      // Check if user has access to the invoice
      if (req.user.role === 'client' && 
          invoice.client._id.toString() !== req.user._id.toString()) {
        return res.error(403, "This invoice doesn't belong to you");
      } else if (req.user.role === 'owner' && 
                 invoice.owner._id.toString() !== req.user._id.toString()) {
        return res.error(403, "You didn't create this invoice");
      }
      
      return res.success(200, "Invoice fetched successfully", invoice);
    } catch (err) {
      console.error("Get invoice error:", err);
      return res.error(500, "Failed to fetch invoice", err.message);
    }
  };
  
  static updateInvoice = async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus, paymentDate, paymentMethod, transactionId, notes } = req.body;
      
      const invoice = await BillingModel.findById(id);
      if (!invoice) {
        return res.error(404, "Invoice not found");
      }
      
      // Check permissions based on update type
      if (paymentStatus && req.user.role === 'client') {
        // Clients can only mark as paid
        if (paymentStatus !== PaymentStatus.PAID) {
          return res.error(403, "Clients can only mark invoices as paid");
        }
        
        if (invoice.client.toString() !== req.user._id.toString()) {
          return res.error(403, "This invoice doesn't belong to you");
        }
      } else if (req.user.role === 'owner') {
        // Owners can update any field for invoices they created
        if (invoice.owner.toString() !== req.user._id.toString()) {
          return res.error(403, "You didn't create this invoice");
        }
      } else {
        return res.error(403, "You don't have permission to update this invoice");
      }
      
      // Update invoice fields
      if (paymentStatus) invoice.paymentStatus = paymentStatus;
      if (paymentDate) invoice.paymentDate = paymentDate;
      if (paymentMethod) invoice.paymentMethod = paymentMethod;
      if (transactionId) invoice.transactionId = transactionId;
      if (notes) invoice.notes = notes;
      
      // If marked as paid and no payment date provided, set it to now
      if (paymentStatus === PaymentStatus.PAID && !paymentDate) {
        invoice.paymentDate = new Date();
      }
      
      await invoice.save();
      
      return res.success(200, "Invoice updated successfully", invoice);
    } catch (err) {
      console.error("Update invoice error:", err);
      return res.error(500, "Failed to update invoice", err.message);
    }
  };
  
  static deleteInvoice = async (req, res) => {
    try {
      const { id } = req.params;
      
      const invoice = await BillingModel.findById(id);
      if (!invoice) {
        return res.error(404, "Invoice not found");
      }
      
      // Only owners who created the invoice can delete it
      if (req.user.role !== 'owner' || 
          invoice.owner.toString() !== req.user._id.toString()) {
        return res.error(403, "You don't have permission to delete this invoice");
      }
      
      await BillingModel.findByIdAndDelete(id);
      
      return res.success(200, "Invoice deleted successfully");
    } catch (err) {
      console.error("Delete invoice error:", err);
      return res.error(500, "Failed to delete invoice", err.message);
    }
  };
  
  static downloadInvoice = async (req, res) => {
    try {
      const { id } = req.params;
      
      const invoice = await BillingModel.findById(id)
        .populate('contract', 'startDate endDate totalAmount')
        .populate('client', 'name email')
        .populate('owner', 'name email');
        
      if (!invoice) {
        return res.error(404, "Invoice not found");
      }
      
      // Check if user has access to the invoice
      if (req.user.role === 'client' && 
          invoice.client._id.toString() !== req.user._id.toString()) {
        return res.error(403, "This invoice doesn't belong to you");
      } else if (req.user.role === 'owner' && 
                 invoice.owner._id.toString() !== req.user._id.toString()) {
        return res.error(403, "You didn't create this invoice");
      }
      
      // For now, we'll just return the invoice data
      // In a real implementation, you would generate a PDF here
      return res.success(200, "Invoice details for PDF generation", invoice);
    } catch (err) {
      console.error("Download invoice error:", err);
      return res.error(500, "Failed to download invoice", err.message);
    }
  };
  
  static sendPaymentReminder = async (req, res) => {
    try {
      const { id } = req.params;
      
      const invoice = await BillingModel.findById(id)
        .populate('client', 'name email');
        
      if (!invoice) {
        return res.error(404, "Invoice not found");
      }
      
      // Only owners who created the invoice can send reminders
      if (req.user.role !== 'owner' || 
          invoice.owner.toString() !== req.user._id.toString()) {
        return res.error(403, "You don't have permission to send reminders for this invoice");
      }
      
      // Check if invoice is actually pending or overdue
      if (invoice.paymentStatus !== PaymentStatus.PENDING && 
          invoice.paymentStatus !== PaymentStatus.OVERDUE) {
        return res.error(400, "Cannot send reminder for an invoice that is not pending or overdue");
      }
      
      // In a real implementation, you would send an email here
      
      return res.success(200, "Payment reminder sent successfully");
    } catch (err) {
      console.error("Send payment reminder error:", err);
      return res.error(500, "Failed to send payment reminder", err.message);
    }
  };
  
  static getBillingAnalytics = async (req, res) => {
    try {
      // Only owners can view analytics
      if (req.user.role !== 'owner') {
        return res.error(403, "Only owners can view billing analytics");
      }
      
      // Calculate total revenue
      const allInvoices = await BillingModel.find({ owner: req.user._id });
      
      const totalAmount = allInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const paidAmount = allInvoices
        .filter(invoice => invoice.paymentStatus === PaymentStatus.PAID)
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      const pendingAmount = allInvoices
        .filter(invoice => invoice.paymentStatus === PaymentStatus.PENDING)
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      const overdueAmount = allInvoices
        .filter(invoice => invoice.paymentStatus === PaymentStatus.OVERDUE)
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      
      // Count invoices by status
      const invoicesByStatus = {
        [PaymentStatus.PAID]: allInvoices.filter(invoice => invoice.paymentStatus === PaymentStatus.PAID).length,
        [PaymentStatus.PENDING]: allInvoices.filter(invoice => invoice.paymentStatus === PaymentStatus.PENDING).length,
        [PaymentStatus.OVERDUE]: allInvoices.filter(invoice => invoice.paymentStatus === PaymentStatus.OVERDUE).length,
        [PaymentStatus.CANCELLED]: allInvoices.filter(invoice => invoice.paymentStatus === PaymentStatus.CANCELLED).length
      };
      
      // Get recent invoices
      const recentInvoices = await BillingModel.find({ owner: req.user._id })
        .populate('client', 'name email')
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Get upcoming due invoices
      const upcomingInvoices = await BillingModel.find({
          owner: req.user._id,
          paymentStatus: PaymentStatus.PENDING,
          dueDate: { $gte: new Date() }
        })
        .populate('client', 'name email')
        .sort({ dueDate: 1 })
        .limit(5);
      
      const analytics = {
        totalAmount,
        paidAmount,
        pendingAmount,
        overdueAmount,
        invoicesByStatus,
        recentInvoices,
        upcomingInvoices
      };
      
      return res.success(200, "Billing analytics fetched successfully", analytics);
    } catch (err) {
      console.error("Get billing analytics error:", err);
      return res.error(500, "Failed to fetch billing analytics", err.message);
    }
  };
}

export default BillingController;
