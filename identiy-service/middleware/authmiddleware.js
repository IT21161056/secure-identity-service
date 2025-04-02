const jwt = require("jsonwebtoken");
const User = require("../model/UserModel");
const { CustomError } = require("../exceptions/baseException");

const protect = async (req, res, next) => {
  let token;

  try {
    token = req.cookies.jwt;

    if (!token) {
      throw new CustomError("Not authorized, no token", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      throw new CustomError("Unauthorized, user not found", 401);
    }

    next();
  } catch (error) {
    next(error);
  }
};

const checkRole = (myRole) => {
  return async (req, res, next) => {
    try {
      if (!req.role || req.role !== myRole) {
        throw new CustomError(`Access denied, ${myRole} role required`, 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  protect,
  checkRole,
};
