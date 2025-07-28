
import express from "express";
import { auth } from "../middlewares/auth.js";
import HoardingModel from "../models/hoarding.js";
import ContractModel from "../models/contract.js";
import PhotoModel from "../models/photo.js";
import UserModel from "../models/user.js";
import AssignmentModel from "../models/assignment.js";
import BillingModel from "../models/billing.js";

const SearchRouter = express.Router();

// Search across multiple entities
SearchRouter.get("/", auth, async (req, res) => {
    try {
        const { query, type, status, city, role, dateRange } = req.query;
        const results = {};
        
        // Search hoardings if no specific type or hoardings type requested
        if (!type || type === 'hoardings') {
            let hoardingQuery = {};
            
            if (query) {
                hoardingQuery.$or = [
                    { name: { $regex: query, $options: 'i' } },
                    { 'location.address': { $regex: query, $options: 'i' } },
                    { 'location.city': { $regex: query, $options: 'i' } }
                ];
            }
            
            if (status) {
                hoardingQuery.status = status;
            }
            
            if (city) {
                hoardingQuery['location.city'] = { $regex: city, $options: 'i' };
            }
            
            const hoardings = await HoardingModel.find(hoardingQuery).limit(20);
            results.hoardings = hoardings;
        }
        
        // Search contracts if no specific type or contracts type requested
        if (!type || type === 'contracts') {
            let contractQuery = {};
            
            if (query) {
                contractQuery.$or = [
                    { _id: { $regex: query, $options: 'i' } },
                    { 'client.name': { $regex: query, $options: 'i' } }
                ];
            }
            
            if (status) {
                contractQuery.status = status;
            }
            
            if (dateRange) {
                const [startDate, endDate] = dateRange.split(',');
                if (startDate && endDate) {
                    contractQuery.startDate = { $gte: new Date(startDate) };
                    contractQuery.endDate = { $lte: new Date(endDate) };
                }
            }
            
            const contracts = await ContractModel.find(contractQuery)
                .populate('hoarding')
                .limit(20);
            
            results.contracts = contracts;
        }
        
        // Search photos if no specific type or photos type requested
        if (!type || type === 'photos') {
            let photoQuery = {};
            
            if (query) {
                photoQuery.$or = [
                    { description: { $regex: query, $options: 'i' } }
                ];
            }
            
            if (status) {
                photoQuery.status = status;
            }
            
            const photos = await PhotoModel.find(photoQuery)
                .populate('hoarding')
                .limit(20);
            
            results.photos = photos;
        }
        
        // Search users if requested
        if (!type || type === 'users') {
            let userQuery = {};
            
            if (query) {
                userQuery.$or = [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ];
            }
            
            if (role) {
                userQuery.role = role;
            }
            
            const users = await UserModel.find(userQuery)
                .select('-password')
                .limit(20);
            
            results.users = users;
        }
        
        // Search assignments if requested
        if (!type || type === 'assignments') {
            let assignmentQuery = {};
            
            if (query) {
                assignmentQuery.$or = [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ];
            }
            
            if (status) {
                assignmentQuery.status = status;
            }
            
            const assignments = await AssignmentModel.find(assignmentQuery)
                .populate('hoarding')
                .populate('photographer')
                .limit(20);
            
            results.assignments = assignments;
        }
        
        // Search billings if requested
        if (!type || type === 'billings') {
            let billingQuery = {};
            
            if (query) {
                billingQuery.$or = [
                    { invoiceNumber: { $regex: query, $options: 'i' } }
                ];
            }
            
            if (status) {
                billingQuery.status = status;
            }
            
            const billings = await BillingModel.find(billingQuery)
                .populate('contract')
                .limit(20);
            
            results.billings = billings;
        }
        
        return res.success(200, "Search results", results);
    } catch (err) {
        console.error("Search error:", err);
        return res.error(500, "Failed to search", err.message);
    }
});

export default SearchRouter;
