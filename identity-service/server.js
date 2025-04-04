require("dotenv").config();
const path = require("path");
const cors = require("cors");
const express = require("express");
const rootRoute = require("./routes/root");
const swaggerJsDoc = require("swagger-jsdoc");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const { logger } = require("./middleware/logger");
const corsOptions = require("./config/corsOptions");
const connectMongoDb = require("./config/dbConnection");
const errorMiddleware = require("./middleware/errorMiddleware");

// auth Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();
const PORT = process.env.PORT || 5016;
const BASE_URL = process.env.API_BASE_URL || "/api/v1";

connectMongoDb();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description:
        "This collection provides a structured set of API requests to interact with the Papaya Buddy mobile application's backend, built with Node.js and Express. The API facilitates disease identification, prediction history tracking, plant maturity stage management, and treatment recommendations.",
      contact: {
        name: "API Support",
        email: "seprojectgroup123@gmail.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}${BASE_URL}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js", "./server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use(`${BASE_URL}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(logger);
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", rootRoute);

/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: API is running
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Check if API is running
 *     tags: [API Status]
 *     responses:
 *       200:
 *         description: API status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
app.get(`${BASE_URL}`, (req, res) => {
  res.json({
    status: "success",
    message: "API is running",
  });
});

// Endpoints
app.use(`${BASE_URL}/auth`, authRoutes);
app.use(`${BASE_URL}/user`, userRoutes);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Fund");
  }
});

// Error handling middleware
app.use(errorMiddleware);

// Server setup

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API base URL: ${BASE_URL}`);
  console.log(`Swagger docs available at: ${BASE_URL}/docs`);
});
