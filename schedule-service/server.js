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

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.API_BASE_URL || "/api/v1";


connectMongoDb();

const swaggerDocs = swaggerJsDoc(getSwaggerOptions(PORT, BASE_URL));
app.use(`${BASE_URL}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


// Endpoints
app.use(`${BASE_URL}/schedule`, scheduleRoutes);

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
