import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getSwaggerOptions = (PORT, BASE_URL) => ({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Secure Identity Service API",
      version: "1.0.0",
      description: `
### 🔐 Secure Academic Identity Management System

This API provides **secure identity management** and **academic resource handling** for institutions:

---

### 🧾 Authentication System

- Login using username/email + password
- HTTP-only cookie for refresh tokens (protects against XSS)
- Short-lived JWT access tokens
- Role-based access control (Student, Lecturer, Admin)

### 🔁 Token Refresh Flow

- Secure refresh token rotation
- Server-side session invalidation on logout
- Seamless access token renewal

### 👥 User Management

- NIC (National ID) based registration
- Multi-role user profiles (Student/User/Lecturer/Admin)
- Admin-controlled user lifecycle
- Profile self-service for users

---

### 📚 Course & Content Management

This API supports **course creation and multimedia content upload**:

🎥 **Video Content Upload & Retrieval**
- Upload course-related videos via multipart/form-data
- Videos are linked to course metadata
- Retrieve uploaded content for management/display

📘 **Course Lifecycle Management**
- Add new courses
- List all available courses
- Retrieve single course by ID
- Delete courses when deprecated

| Endpoint          | Method | Description                      |
|------------------|--------|----------------------------------|
| /content         | POST   | Upload a video (form-data)       |
| /content         | GET    | Get all uploaded content         |
| /courses         | POST   | Add a new course                 |
| /courses         | GET    | Get all courses                  |
| /courses/{id}    | GET    | Get course by ID                 |
| /courses/{id}    | DELETE | Delete course by ID              |
      `,

      contact: {
        name: "API Support",
        email: "seprojectgroup123@gmail.com",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}${BASE_URL}`,
        description: "Development Server",
      },
      {
        url: `https://your-production-url.com${BASE_URL}`,
        description: "Production Server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "Login, token refresh, and logout endpoints",
      },
      {
        name: "Users",
        description: "User profile and account management",
      },
      {
        name: "Admin",
        description: "Administrative user operations",
      },
      {
        name: "Courses",
        description: "Course creation, listing, retrieval, and removal",
      },
      {
        name: "Content",
        description: "Multimedia content upload and retrieval",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken",
          description: "Refresh token stored in HttpOnly cookie",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Access token in Authorization header",
        },
      },
      schemas: {
        Course: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "642abc1234567890abcdef12",
            },
            courseName: {
              type: "string",
              example: "Software Engineering Fundamentals",
            },
            courseDescription: {
              type: "string",
              example: "Introductory course on software development.",
            },
            courseCode: {
              type: "string",
              example: "SE101",
            },
            contents: {
              type: "array",
              items: {
                type: "string",
                example: "642def4567890123abcde789",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Content: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "642def4567890123abcde789",
            },
            contentName: {
              type: "string",
              example: "Lecture 1: Intro to SE",
            },
            contentDescription: {
              type: "string",
              example: "Overview of key concepts",
            },
            type: {
              type: "string",
              enum: ["video", "reading"],
              example: "video",
            },
            body: {
              type: "string",
              example: "https://cdn.example.com/lecture1.mp4",
            },
            source: {
              type: "string",
              example: "Zoom Recording",
            },
            courseId: {
              type: "string",
              example: "642abc1234567890abcdef12",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, "../routes/*.js"),
    path.join(__dirname, "../models/*.js"),
    path.join(__dirname, "../server.js"),
  ],
});
