import dotenv from "dotenv";
dotenv.config();
import path from "path";
import cors from "cors";
import express from "express";
import { fileURLToPath } from "url";
import swaggerJsDoc from "swagger-jsdoc";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import corsOptions from "./config/corsOptions.js";
import connectMongoDb from "./config/dbConnection.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { getSwaggerOptions } from "./config/swaggerConfig.js";

import scheduleRoutes from "./routes/schedule.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.API_BASE_URL || "/api/v1/schedule";

// Database connection
connectMongoDb();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

// Swagger Documentation Setup
const swaggerSpec = swaggerJsDoc(getSwaggerOptions(PORT, BASE_URL));
app.use(
  `${BASE_URL}/docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Schedule Service API",
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      docExpansion: "none",
      filter: true,
      persistAuthorization: true,
    },
  })
);

// Add JSON endpoint for Swagger spec
app.get(`${BASE_URL}/docs.json`, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use(`${BASE_URL}/`, scheduleRoutes);

// Health check endpoint
app.get(`${BASE_URL}/health`, (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    version: "1.0.0",
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Server startup
app.listen(PORT, () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`API Documentation:`);
  console.log(`- Swagger UI: http://localhost:${PORT}${BASE_URL}/docs`);
  console.log(`- JSON Spec:  http://localhost:${PORT}${BASE_URL}/docs.json`);
  console.log(`\nAvailable Endpoints:`);
  console.log(`- ${BASE_URL}/schedule`);
  console.log(`- ${BASE_URL}/health\n`);
});