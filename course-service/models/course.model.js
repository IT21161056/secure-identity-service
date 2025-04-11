import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CourseSchema = new Schema(
  {
    courseName: {
      type: String,
      required: true,
    },
    courseDescription: {
      type: String,
    },
    courseCode: {
      type: String,
      required: true,
    },
    contents: [{ type: Schema.Types.ObjectId, ref: "Content" }],
  },
  { timestamps: true }
);

export default model("Course", CourseSchema);
