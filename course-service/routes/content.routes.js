import express from "express";
import upload from "../middleware/multer.js";
import {
  addContent,
  getAllContent,
} from "../controllers/content.controller.js";

const router = express.Router();

/**
 * @swagger
 * /content:
 *   post:
 *     summary: Upload new content
 *     tags: [Content]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *               contentName:
 *                 type: string
 *               contentDescription:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [video, reading]
 *               body:
 *                 type: string
 *               source:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Content uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/", upload.single("video"), addContent);

/**
 * @swagger
 * /content:
 *   get:
 *     summary: Get all uploaded content
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: List of uploaded content
 *       500:
 *         description: Server error
 */
router.get("/", getAllContent);

export default router;
