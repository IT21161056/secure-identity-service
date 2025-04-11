import express from "express";
const router = express.Router();
import {
  addContent,
  getAllContent,
} from "../controllers/content.controller.js";
import upload from "../middleware/multer.js";

router.post("/", upload.single("video"), addContent);
router.get("/", getAllContent);

export default router;
