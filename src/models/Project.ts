import mongoose, { Schema, model, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "On Hold", "Completed"],
      default: "Active",
    },
    startDate: { type: Date, required: true },
    completionDate: { type: Date },
    budget: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    manager: { type: String },
    progress: { type: Number, min: 0, max: 100 },
    description: { type: String },
  },
  { timestamps: true }
);

export default models.Project || model("Project", ProjectSchema);


