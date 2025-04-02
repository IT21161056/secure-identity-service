const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Skip token verification for login or auth-related routes
  if (req.originalUrl.startsWith("/auth")) {
    return next(); // Allow auth routes to proceed without token verification
  }

  // Check if the Authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" }); // 401 if no valid Bearer token
  }

  // Extract token from the Authorization header
  const token = authHeader.split(" ")[1];

  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      // Check if the error is specifically for an expired token
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" }); // 401 Unauthorized for expired tokens
      }
      // Handle other JWT errors
      return res.status(403).json({ message: "Forbidden" }); // 403 Forbidden for other token errors
    }

    // Assign relevant user info to request object
    req.user = decoded.UserInfo.regNumber; // Use regNumber instead of username
    req.role = decoded.UserInfo.role;

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = verifyJWT;
