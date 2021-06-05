import mongoose from "mongoose";
import { User } from "./user";

const projectSchema = new mongoose.Schema({
    name: String,
    owner: User,
    isTemplate: Boolean
},
{ timestamps: true });

const Project = mongoose.model('Project', projectSchema);

export {projectSchema, Project};