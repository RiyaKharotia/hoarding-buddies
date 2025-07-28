
import express from "express";
import ContractController from "../controllers/contractController.js";
import { auth } from "../middlewares/auth.js";

const ContractRouter = express.Router();

// Create a new contract
ContractRouter.post("/", auth, ContractController.createContract);

// Get all contracts
ContractRouter.get("/", auth, ContractController.getAllContracts);

// Get contract by ID
ContractRouter.get("/:id", auth, ContractController.getContractById);

// Update contract
ContractRouter.put("/:id", auth, ContractController.updateContract);

// Delete contract
ContractRouter.delete("/:id", auth, ContractController.deleteContract);

// Download contract PDF
ContractRouter.get("/:id/download", auth, ContractController.downloadContract);

export default ContractRouter;
