const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const accessTokenExpiresIn = "15m";
const refreshTokenExpiresIn = "7d";

function createAccessToken(user, token) {
  return jwt.sign(
    {
      UserInfo: {
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
    { expiresIn: accessTokenExpiresIn }
  );
}

function createRefreshToken(user, token) {
  return jwt.sign(
    {
      email: user.email,
      id: user._id,
    },
    token,
    {
      expiresIn: refreshTokenExpiresIn,
    }
  );
}

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { password, email } = req.body;

  if (!email || !password) {
    throw new CustomError("Email and password are required", 400);
  }

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser) {
    throw new CustomError("Invalid email or password", 401);
  }

  const isPasswordValid = await foundUser.matchPassword(password);

  if (!isPasswordValid) {
    throw new CustomError("Invalid email or password", 401);
  }

  const accessToken = createAccessToken(
    foundUser,
    process.env.ACCESS_TOKEN_SECRET
  );

  const refreshToken = createRefreshToken(
    foundUser,
    process.env.REFRESH_TOKEN_SECRET
  );

  // Create secure cookie with refresh token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  // Exclude password from the user data sent to client
  const userResponse = {
    _id: foundUser._id,
    firstName: foundUser.firstName,
    lastName: foundUser.lastName,
    email: foundUser.email,
    nic: foundUser.nic,
    phone: foundUser.phone,
    role: foundUser.role,
    createdAt: foundUser.createdAt,
    updatedAt: foundUser.updatedAt,
  };

  res.json({ user: userResponse, accessToken });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) throw new CustomError("Refresh token required", 401);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) throw new CustomError("Invalid refresh token", 403);

      const foundUser = await User.findById(decoded.id).exec();

      if (!foundUser) throw new CustomError("User not found", 404);

      const newAccessToken = createAccessToken(
        foundUser,
        process.env.ACCESS_TOKEN_SECRET
      );

      res.json({ accessToken: newAccessToken });
    })
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(204); //No content
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.json({ message: "Refresh token cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
