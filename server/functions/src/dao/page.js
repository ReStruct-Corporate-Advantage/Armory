import mongoose from "mongoose";
import { Page } from "../models/page.js";

mongoose.set('debug', true);

class PageDAO {

    static async findPageById(_id) {
        return await Page.find({ _id });
    }

    static async findPageByName(name) {
        return await Page.findOne({ name });
    }

    static async getPages(query) {
        return await Page.find(query || {}).lean();
    }

    static async createPage(page) {
        return await Page.create(page);
    }

    static async updatePage(page) {
        return await page.save();
    }
}

export default PageDAO;
