import mongoose from "mongoose";
import { Project } from "../models/project.js";

class ProjectDAO {

    static async findProjectById(_id) {
        return await Project.find({ _id });
    }

    static async findProjectByName(name) {
        return await Project.findOne({ name });
    }

    static async getProjects(query) {
        return await Project.find(query || {}).lean();
    }

    static async createProject(project) {
        return await Project.create(project);
    }

    static async updateProject(project) {
        return await project.save();
    }
}

export default ProjectDAO;
