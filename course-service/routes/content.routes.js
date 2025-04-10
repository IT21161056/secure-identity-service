import express from "express";
const router = express.Router();
import {
  addContent,
  getAllContent,
} from "../controllers/content.controller.js";

router.route("/").post(addContent);
router.route("/").get(getAllContent);

export default router;
