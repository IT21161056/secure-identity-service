import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ContentSchema = new Schema(
  {
    contentName: {
      type: String,
      required: true,
    },
    contentDescription: {
      type: String,
    },
    type: {
      type: String,
      enum: ["video", "reading"],
    },
    body: {
      type: String,
    },
    source: {
      type: String,
    },

    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
  },
  { timestamps: true }
);

// Compile model from schema

export default model("Content", ContentSchema);
