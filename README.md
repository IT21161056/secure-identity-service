# 🔐 Authentication Microservice – CTSE SE4010 Assignment

This project is a secure, containerized **Authentication Microservice** developed as part of the Cloud Computing and DevOps practices assignment (SE4010). It is built using **Node.js and Express.js**, integrated with **GitHub Actions for CI/CD**, and deployed on **Microsoft Azure** via **Azure Container Apps**. The service handles user registration, login, logout, and profile management with security best practices.

---

## 🚀 Features

- 🔐 JWT-based Authentication
- 🔑 Password Hashing using Bcrypt
- 📋 Role-based Access Control
- 🔁 Secure Logout & Token Invalidation
- 📦 Dockerized Deployment
- ☁️ Hosted on Azure Container Apps
- 🔍 SAST Integrated with SonarCloud
- 🔐 Secrets Managed via GitHub Actions

---

## 🧱 Architecture Overview

![Architecture Diagram](./architecture.png)

- **Client**: Web or Postman
- **API Gateway**: Kong (routes requests to microservices)
- **CI/CD**: GitHub Actions handles automated build, test, and deployment
- **Container Registry**: Docker images pushed to Azure Container Registry
- **Deployment**: Azure Container Apps hosting the microservice
- **Security**: JWT, bcrypt, role-based access, environment-based secrets

---

## 📂 API Endpoints

| Method | Endpoint    | Description                   | Auth Required |
| ------ | ----------- | ----------------------------- | ------------- |
| POST   | `/register` | Register a new user           | ❌            |
| POST   | `/login`    | Login and receive a token     | ❌            |
| POST   | `/logout`   | Logout and invalidate token   | ✅            |
| GET    | `/profile`  | Get authenticated user's data | ✅            |
| GET    | `/users`    | Get all users (admin only)    | ✅ (Admin)    |

---

## ⚙️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: (Assumed MongoDB or similar)
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Cloud Provider**: Azure Container Apps
- **Security Tools**: SonarCloud (SAST), Bcrypt, JWT

---

## 🛠️ DevOps Workflow

1. **Push to GitHub** → triggers GitHub Actions.
2. **GitHub Actions**:
   - Run tests
   - Perform SAST via SonarCloud
   - Build Docker Image
   - Push to Azure Container Registry
   - Deploy to Azure Container App

---

## 🔒 Security Measures

- Least privilege IAM roles on Azure
- Role-based access within app logic
- HTTPS enabled via Azure Gateway
- JWT-based stateless auth
- Secure password hashing
- Environment variables and GitHub secrets
- Rate limiting & request validation

---

## 📜 How to Use (Locally)

1. Clone this repo:
   ```bash
   git clone https://github.com/your-username/auth-microservice.git
   cd auth-microservice
   ```

## 🧪 Local Development

### Set up environment variables in `.env`:

```env
NODE_ENV=production
MONGO_URL=mongodb+srv://username:password@cluster0.example.mongodb.net/secure_identity?retryWrites=true&w=majority
API_BASE_URL = "/api/v1"
PORT=5000
ALLOW_SWAGGER=true

JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

### Run locally:

```bash
npm install
npm run dev
```

### Test with Postman or curl.

## 📦 Docker

Build and run with Docker:

```bash
docker build -t auth-service .
docker run -p 5000:5000 --env-file .env auth-service
```

## 🌐 Public Demo

- 🔗 Live API URL: http://identity-service.d4f9g4f5cseshth4.westindia.azurecontainer.io:5000
- 🔍 Postman Docs: [View Documentation](https://documenter.getpostman.com/view/38550372/2sB2cd6Jjg)

## 🔒 Security Measures

- Least privilege IAM roles on Azure
- Role-based access within app logic
- HTTPS enabled via Azure Gateway
- JWT-based stateless auth
- Secure password hashing
- Environment variables and GitHub secrets
- Rate limiting & request validation

## 📄 License

This project is licensed for educational use as part of coursework (SE4010 – CTSE).

## 👨‍💻 Contributors

- [Peiris M.M.A.E](https://github.com/IT21161056)
- [Perakum K.K.P](https://github.com/IT21160066)
- [Mangchanayaka M.V.V](https://github.com/IT21161810)
- [Senevirathne U.W.H.N](https://github.com/IT21386022)

## 📧 Contact

For any questions or feedback, reach out at: pieris.anojerantha@email.com
