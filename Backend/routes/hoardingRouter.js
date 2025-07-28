
import express from "express";
import HoardingController from "../controllers/hoardingController.js";
import { auth } from "../middlewares/auth.js";

const HoardingRouter = express.Router();

// Create hoarding
HoardingRouter.post("/", auth, HoardingController.upload.array("images", 10), HoardingController.createHoarding);

// Get all hoardings
HoardingRouter.get("/", auth, HoardingController.getAllHoardings);

// Get hoarding by ID
HoardingRouter.get("/:id", auth, HoardingController.getHoardingById);

// Update hoarding
HoardingRouter.put("/:id", auth, HoardingController.upload.array("images", 10), HoardingController.updateHoarding);

// Delete hoarding
HoardingRouter.delete("/:id", auth, HoardingController.deleteHoarding);

// Remove hoarding image
HoardingRouter.delete("/:id/images", auth, HoardingController.removeHoardingImage);

// Get hoardings by status
HoardingRouter.get("/status/:status", auth, HoardingController.getHoardingsByStatus);

// Get hoardings by location
HoardingRouter.get("/location/:city", auth, HoardingController.getHoardingsByLocation);

export default HoardingRouter;
