import asyncHandler from "express-async-handler";
import Course from "../models/course.model.js";
import Content from "../models/content.model.js";

/**
 * @desc    Create new content
 * @route   POST /api/content
 * @access  Private/Admin
 */

const addContent = asyncHandler(async (req, res) => {
  const { contentName, contentDescription, type, body, source, courseId } =
    req.body;

  // console.log("req.body", req.body);

  if (!contentName)
    throw new CustomError("There should be a contentName to the content", 400);

  if (type == "video") {
    if (!source) throw new CustomError("Source field is required.", 400);
    else if (!body)
      throw new CustomError("There should be content to read.", 400);
  }
  const course = await Course.findById(courseId);

  // console.log("course id >>>", course);

  if (!course) throw new CustomError("Course not found.", 404);
  const content = await Content.create({
    contentName,
    contentDescription,
    type,
    body,
    source,
    courseId,
  });

  course.contents.push(content._id);
  const updated = await course.save();
  res.status(200).json(updated);
});

const getAllContent = asyncHandler(async (req, res) => {
  const content = await Content.find();

  if (!content) throw new CustomError("Content not found.", 404);

  res.status(200).json(content);
});

export { addContent, getAllContent };
