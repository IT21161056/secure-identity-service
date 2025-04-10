import asyncHandler from "express-async-handler";
import Course from "../models/course.model.js";

/**
 * @desc    Create new course
 * @route   POST /api/course
 * @access  Private/Admin
 */

const addCourse = asyncHandler(async (req, res) => {
  const { courseName, courseDescription, courseCode } = req.body;

  console.log(">>>", req.body);

  if (!courseName || !courseCode)
    throw new CustomError("Fields are required.", 500);

  const newCourse = await Course.create({
    courseName,
    courseDescription,
    courseCode,
  });

  if (!newCourse) throw new CustomError("Course creation failed.", 500);

  res.status(200).json(newCourse);
});

/**
 * @desc    Get all courses
 * @route   GET /api/course
 * @access  Private/Admin
 */

const getCourses = asyncHandler(async (_, res) => {
  const courses = await Course.find();

  if (!courses) throw new CustomError("Courses not found.", 404);

  res.status(200).json(courses);
});

/**
 * @desc    Get course by ID
 * @route   GET /api/course/:id
 * @access  Private/Admin
 */

const getCourseById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const course = await Course.findOne({ _id: id }).populate("contents");

  res.status(200).json(course);
});

/**
 * @desc    Delete course
 * @route   DELETE /api/course/:id
 * @access  Private/Admin
 */

const removeCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const courses = await Course.findByIdAndDelete(id);

  res.status(200).json(courses);
});

export { addCourse, getCourses, removeCourse, getCourseById };
