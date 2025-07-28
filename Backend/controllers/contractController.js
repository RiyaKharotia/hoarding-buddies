
import ContractModel from "../models/contract.js";
import UserModel from "../models/user.js";
import HoardingModel from "../models/hoarding.js";
import { ContractStatus } from "../utils/types.js";

class ContractController {
  static createContract = async (req, res) => {
    try {
      const { hoarding, client, startDate, endDate, totalAmount, termsAndConditions } = req.body;
      
      if (!hoarding || !client || !startDate || !endDate || !totalAmount) {
        return res.error(400, "Missing required fields");
      }
      
      // Verify hoarding exists
      const hoardingExists = await HoardingModel.findById(hoarding);
      if (!hoardingExists) {
        return res.error(404, "Hoarding not found");
      }
      
      // Verify client exists
      const clientExists = await UserModel.findOne({ _id: client, role: 'client' });
      if (!clientExists) {
        return res.error(404, "Client not found");
      }
      
      // Only owner can create contracts
      if (req.user.role !== 'owner') {
        return res.error(403, "Only owners can create contracts");
      }
      
      // Create contract
      const contract = new ContractModel({
        hoarding,
        client,
        owner: req.user._id,
        startDate,
        endDate,
        totalAmount,
        status: ContractStatus.PENDING,
        termsAndConditions
      });
      
      await contract.save();
      
      return res.success(201, "Contract created successfully", contract);
    } catch (err) {
      console.error("Create contract error:", err);
      return res.error(500, "Failed to create contract", err.message);
    }
  };
  
  static getAllContracts = async (req, res) => {
    try {
      const { status, clientId } = req.query;
      
      // Build query filters
      const filter = {};
      
      if (status) filter.status = status;
      if (clientId) filter.client = clientId;
      
      // Filter by role (owner sees all contracts they created, clients see their contracts)
      if (req.user.role === 'client') {
        filter.client = req.user._id;
      } else if (req.user.role === 'owner') {
        filter.owner = req.user._id;
      } else {
        return res.error(403, "You don't have permission to view contracts");
      }
      
      const contracts = await ContractModel.find(filter)
        .populate('hoarding', 'name location dailyRate hoardingNumber')
        .populate('client', 'name email phone')
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 });
        
      return res.success(200, "Contracts fetched successfully", contracts);
    } catch (err) {
      console.error("Get contracts error:", err);
      return res.error(500, "Failed to fetch contracts", err.message);
    }
  };
  
  static getContractById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const contract = await ContractModel.findById(id)
        .populate('hoarding', 'name location size dailyRate images hoardingNumber')
        .populate('client', 'name email phone')
        .populate('owner', 'name email phone');
        
      if (!contract) {
        return res.error(404, "Contract not found");
      }
      
      // Check if user has access to the contract
      if (req.user.role === 'client' && 
          contract.client._id.toString() !== req.user._id.toString()) {
        return res.error(403, "This contract doesn't belong to you");
      } else if (req.user.role === 'owner' && 
                 contract.owner._id.toString() !== req.user._id.toString()) {
        return res.error(403, "You didn't create this contract");
      }
      
      return res.success(200, "Contract fetched successfully", contract);
    } catch (err) {
      console.error("Get contract error:", err);
      return res.error(500, "Failed to fetch contract", err.message);
    }
  };
  
  static updateContract = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, totalAmount, startDate, endDate, termsAndConditions } = req.body;
      
      const contract = await ContractModel.findById(id);
      if (!contract) {
        return res.error(404, "Contract not found");
      }
      
      // Only owners can update contracts
      if (req.user.role !== 'owner' || 
          contract.owner.toString() !== req.user._id.toString()) {
        return res.error(403, "You don't have permission to update this contract");
      }
      
      // Update contract fields
      if (status) contract.status = status;
      if (totalAmount) contract.totalAmount = totalAmount;
      if (startDate) contract.startDate = startDate;
      if (endDate) contract.endDate = endDate;
      if (termsAndConditions) contract.termsAndConditions = termsAndConditions;
      
      await contract.save();
      
      return res.success(200, "Contract updated successfully", contract);
    } catch (err) {
      console.error("Update contract error:", err);
      return res.error(500, "Failed to update contract", err.message);
    }
  };
  
  static deleteContract = async (req, res) => {
    try {
      const { id } = req.params;
      
      const contract = await ContractModel.findById(id);
      if (!contract) {
        return res.error(404, "Contract not found");
      }
      
      // Only owners who created the contract can delete it
      if (req.user.role !== 'owner' || 
          contract.owner.toString() !== req.user._id.toString()) {
        return res.error(403, "You don't have permission to delete this contract");
      }
      
      await ContractModel.findByIdAndDelete(id);
      
      return res.success(200, "Contract deleted successfully");
    } catch (err) {
      console.error("Delete contract error:", err);
      return res.error(500, "Failed to delete contract", err.message);
    }
  };
  
  static downloadContract = async (req, res) => {
    try {
      const { id } = req.params;
      
      const contract = await ContractModel.findById(id)
        .populate('hoarding', 'name location size dailyRate')
        .populate('client', 'name email')
        .populate('owner', 'name email');
        
      if (!contract) {
        return res.error(404, "Contract not found");
      }
      
      // Check if user has access to the contract
      if (req.user.role === 'client' && 
          contract.client._id.toString() !== req.user._id.toString()) {
        return res.error(403, "This contract doesn't belong to you");
      } else if (req.user.role === 'owner' && 
                 contract.owner._id.toString() !== req.user._id.toString()) {
        return res.error(403, "You didn't create this contract");
      }
      
      // For now, we'll just return the contract data
      // In a real implementation, you would generate a PDF here
      return res.success(200, "Contract details for PDF generation", contract);
    } catch (err) {
      console.error("Download contract error:", err);
      return res.error(500, "Failed to download contract", err.message);
    }
  };
}

export default ContractController;
