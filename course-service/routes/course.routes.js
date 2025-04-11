import express from "express";
const router = express.Router();
import {
  addCourse,
  getCourses,
  getCourseById,
  removeCourse,
} from "../controllers/course.controller.js";

router.route("/").post(addCourse);
router.route("/").get(getCourses);
router.route("/:id").get(getCourseById);
router.route("/:id").delete(removeCourse);

export default router;
