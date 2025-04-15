import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getSwaggerOptions = (PORT, BASE_URL) => ({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Schedule Service API",
      version: "1.0.0",
      description: "API for managing academic schedules",
    },
    servers: [{ url: `http://localhost:${PORT}${BASE_URL}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/schedule.route.js")],
});