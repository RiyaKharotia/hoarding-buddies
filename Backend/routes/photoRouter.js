
import express from "express";
import PhotoController from "../controllers/photoController.js";
import { auth } from "../middlewares/auth.js";

const PhotoRouter = express.Router();

// Get all photos
PhotoRouter.get("/", auth, PhotoController.getAllPhotos);

// Get photo by ID
PhotoRouter.get("/:id", auth, PhotoController.getPhotoById);

// Create photo
PhotoRouter.post("/", auth, PhotoController.upload.single("photo"), PhotoController.createPhoto);

// Update photo
PhotoRouter.put("/:id", auth, PhotoController.updatePhoto);

// Delete photo
PhotoRouter.delete("/:id", auth, PhotoController.deletePhoto);

// Get photos by hoarding
PhotoRouter.get("/hoarding/:hoardingId", auth, PhotoController.getPhotosByHoarding);

// Get photos by assignment
PhotoRouter.get("/assignment/:assignmentId", auth, PhotoController.getPhotosByAssignment);

export default PhotoRouter;
