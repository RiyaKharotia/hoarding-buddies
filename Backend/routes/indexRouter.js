
import express from "express";
import HoardingRouter from "./hoardingRouter.js";
import UserRouter from "./userRouter.js";
import PhotoRouter from "./photoRouter.js";
import ContractRouter from "./contractRouter.js";
import BillingRouter from "./billingRouter.js";
import AssignmentRouter from "./assignmentRouter.js";
import SearchRouter from "./searchRouter.js";

const IndexRouter = express.Router();

// Health check endpoint
IndexRouter.get("/health", (req, res) => {
    res.success(200, "Server is running", { timestamp: new Date() });
});

// Search endpoint that doesn't require authentication
IndexRouter.get("/public-search", async (req, res) => {
    try {
        const { query, type } = req.query;
        const results = {};
        
        // Only search hoardings for public search
        if (!type || type === 'hoardings') {
            const HoardingModel = await import("../models/hoarding.js").then(m => m.default);
            const hoardings = await HoardingModel.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { 'location.city': { $regex: query, $options: 'i' } }
                ],
                status: "active" // Only show active hoardings for public
            }).limit(10);
            
            results.hoardings = hoardings;
        }
        
        return res.success(200, "Public search results", results);
    } catch (err) {
        console.error("Public search error:", err);
        return res.error(500, "Failed to search", err.message);
    }
});

// Route middlewares
IndexRouter.use("/hoardings", HoardingRouter);
IndexRouter.use("/users", UserRouter);
IndexRouter.use("/photos", PhotoRouter);
IndexRouter.use("/contracts", ContractRouter);
IndexRouter.use("/billings", BillingRouter);
IndexRouter.use("/assignments", AssignmentRouter);
IndexRouter.use("/search", SearchRouter);

export default IndexRouter;
