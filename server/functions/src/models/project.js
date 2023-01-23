import mongoose from "mongoose";
import { armamentSchema } from "./armory";

const projectSchema = new mongoose.Schema(armamentSchema,
    {
      descriptor: {
        pages: [{type: mongoose.Schema.Types.ObjectId, ref: "Page"}]
      }
    },
    {timestamps: true},
);

const Project = mongoose.model("Project", projectSchema);

export {projectSchema, Project};
