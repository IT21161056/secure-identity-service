const express = require("express");
const router = express.Router();
const { login, refresh, logout } = require("../controllers/auth.controller");

// const verifyJWT = require("../middleware/verifyJWT");
// router.use(verifyJWT);

router.route("/login").post(login);

router.route("/refresh").post(refresh);

router.route("/logout").post(logout);

module.exports = router;
