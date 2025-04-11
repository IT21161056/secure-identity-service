import asyncHandler from "express-async-handler";
import Course from "../models/course.model.js";
import Content from "../models/content.model.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";

/**
 * @desc    Create new content
 * @route   POST /api/content
 * @access  Private/Admin
 */

const addContent = asyncHandler(async (req, res) => {
  const { contentName, contentDescription, type, body, courseId } = req.body;

  console.log("req.body", req.body);
  console.log("req.file", req.file);

  if (!contentName) {
    res.status(400);
    throw new Error("There should be a contentName to the content");
  }

  let videoUrl = null;

  if (type === "video") {
    if (!req.file) {
      res.status(400);
      throw new Error("Video file is required for video content.");
    }

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "videos" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadStream();
    videoUrl = result.secure_url;
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }

  const content = await Content.create({
    contentName,
    contentDescription,
    type,
    body,
    source: type === "video" ? videoUrl : null,
    courseId,
  });

  course.contents.push(content._id);
  const updatedCourse = await course.save();

  res.status(200).json(updatedCourse);
});

const getAllContent = asyncHandler(async (req, res) => {
  const content = await Content.find();

  if (!content) throw new new Error("Content not found.", 404)();

  res.status(200).json(content);
});

export { addContent, getAllContent };
