const jwt = require("jsonwebtoken");
const {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = require("./constants");

const createAccessToken = (user, token) => {
  return jwt.sign(
    {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        nic: user.nic,
        phone: user.phone,
        role: user.role,
      },
    },
    token,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

const createRefreshToken = (user, token) => {
  return jwt.sign(
    {
      email: user.email,
      id: user._id,
    },
    token,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

module.exports = { createAccessToken, createRefreshToken };
