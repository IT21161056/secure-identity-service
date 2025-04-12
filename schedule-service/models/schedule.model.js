import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ScheduleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    startTime: {
      type: Date,
      required: true,
    },
    module:{
      type: String,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: false,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);


export default model("Schema", ScheduleSchema);