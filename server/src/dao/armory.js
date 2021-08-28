import mongoose from "mongoose";
import { ArmamentCategory } from "../models/armamentCategory.js";
import { Armament } from "../models/armory.js";

class ArmoryController {

    static async findArmamentByName (componentName) {
        return await Armament.findOne({componentName})
    }

    static async findArmamentCategoryByName (name) {
        return await ArmamentCategory.findOne({name})
    }

    static async getArmsCategories () {
        return await ArmamentCategory.find().lean();
    }

    static async populateArmaments (category) {
        if (!category.leafCategory) {
            return category;
        }
        const armaments = await Armament.find({'_id': { $in: category.items}}).lean();
        category.items = armaments;
        return category;
    }

    static async bulkInsert (documents, username, parent) {
        const backReferencedCategories = [];
        const backReferencedArms = [];
        const parentId = parent && parent._id;
        documents && documents.forEach(async document => {
            if (document.items) {
                let {displayName, name, icon, expanded, leafCategory, meta} = document;
                const flatInfo = {displayName, name, icon, expanded, leafCategory, meta};
                flatInfo.meta = flatInfo.meta ? flatInfo.meta : {};
                flatInfo.meta.createdBy = flatInfo.meta.createdBy ? flatInfo.meta.createdBy : username;
                parentId && (flatInfo.armamentCategory = parentId);
                const _id = new mongoose.Types.ObjectId();
                const category = new ArmamentCategory({_id, ...flatInfo})
                parent && parent.items.push(_id);
                backReferencedCategories.push(category);
                ArmoryController.bulkInsert(document.items, username, category);
            } else {
                document.armamentCategory = parentId;
                document.meta = document.meta ? document.meta : {}
                document.meta.createdBy = document.meta.createdBy ? document.meta.createdBy : username
                const _id = new mongoose.Types.ObjectId();
                const armament = new Armament({_id, ...document});
                parent && parent.items.push(_id);
                backReferencedArms.push(armament);
            }
        });
        await ArmamentCategory.insertMany(backReferencedCategories);
        await Armament.insertMany(backReferencedArms);
        return true;
    }

    static async createArmament (armament) {
        return await Armament.create(armament);
    }

    static async updateArmament (doc) {        
        return await doc.save();
    }
}

export default ArmoryController;