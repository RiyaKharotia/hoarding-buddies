
import express from "express";
import AssignmentController from "../controllers/assignmentController.js";
import { auth } from "../middlewares/auth.js";

const AssignmentRouter = express.Router();

// Photographer stats (put this first to avoid conflicting with /:id route)
AssignmentRouter.get("/photographers/stats", auth, AssignmentController.getPhotographerStats);

// Create assignment
AssignmentRouter.post("/", auth, AssignmentController.createAssignment);

// Get assignments
AssignmentRouter.get("/", auth, AssignmentController.getAssignments);

// Get assignment by ID
AssignmentRouter.get("/:id", auth, AssignmentController.getAssignmentById);

// Update assignment status
AssignmentRouter.put("/:id/status", auth, AssignmentController.updateAssignmentStatus);

// Delete assignment
AssignmentRouter.delete("/:id", auth, AssignmentController.deleteAssignment);

export default AssignmentRouter;
