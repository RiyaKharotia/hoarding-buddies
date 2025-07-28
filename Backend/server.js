
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./configs/dbConfig.js";
import { ResponseHandler } from "./middlewares/response.js";
import indexRouter from "./routes/indexRouter.js";
import path from "path";
import { fileURLToPath } from "url";
import { PORT } from "./configs/envConfig.js";
import initializeStorageDirs from "./utils/initializeStorage.js";
import { seedDatabase } from "./utils/seedData.js";

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize storage directories
initializeStorageDirs();

// Connect to the database
connectDB();

// Automatically seed database on server start
(async () => {
  try {
    console.log("Seeding database...");
    await seedDatabase();
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
})();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(ResponseHandler);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use("/api", indexRouter);

// Healthcheck endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// Start the server
const port = PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
