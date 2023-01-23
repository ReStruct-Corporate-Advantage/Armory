import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      state: {
        type: String,
        enum: ["NEW", "INPROGRESS", "COMPLETED", "ABANDONED", "DEFERRED", "ARCHIVED"],
        default: "NEW"
      },
      isTemplate: Boolean,
    },
    {timestamps: true},
);

const Project = mongoose.model("Project", projectSchema);

export {projectSchema, Project};
