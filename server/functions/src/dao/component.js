import mongoose from "mongoose";
import { ArmamentCategory } from "../models/armamentCategory.js";
import { Component } from "../models/component.js";

mongoose.set('debug', true);

class ComponentDAO {

    static async findComponentById(_id) {
        return await Component.find({ _id });
    }

    static async findComponentByName(name) {
        return await Component.findOne({ name });
    }

    static async getComponents(query) {
        return await Component.find(query || {}).lean();
    }

      /**
   * Gets armament objects corresponding to their ObjectIds in armament category and replaces IDs with objects in category.
   *
   * @param category
   * @returns
   */
  static async populateComponentsInCategories(category, query) {
    if (!category.leafCategory) {
      return category;
    }
    const components = await Component.find({
      _id: {$in: category.items},
      ...(query || {})
    }).lean();
    category.items = components;
    return category;
  }

    static async bulkInsert(documents, username, parent, freeze) {
        const backReferencedCategories = [];
        const backReferencedArms = [];
        const parentId = parent && parent._id;
        documents &&
          documents.forEach(async (document) => {
            if (document.items) {
              const {displayName, name, icon, expanded, leafCategory, meta} =
                document;
              const flatInfo = {
                displayName,
                name,
                icon,
                expanded,
                leafCategory,
                meta,
              };
              flatInfo.meta = flatInfo.meta ? flatInfo.meta : {};
              flatInfo.meta.createdBy = flatInfo.meta.createdBy ?
                flatInfo.meta.createdBy :
                username;
              flatInfo.freeze = true;
              parentId && (flatInfo.armamentCategory = parentId);
              const _id = new mongoose.Types.ObjectId();
              const category = new ArmamentCategory({_id, ...flatInfo});
              parent && parent.items.push(_id);
              backReferencedCategories.push(category);
              ComponentDAO.bulkInsert(document.items, username, category, freeze);
            } else {
              document.armamentCategory = parentId;
              document.meta = document.meta ? document.meta : {};
              document.meta.createdBy = document.meta.createdBy ?
                document.meta.createdBy :
                username;
              document.freeze = freeze;
              const _id = new mongoose.Types.ObjectId();
              const armament = new Component({_id, ...document});
              parent && parent.items.push(_id);
              backReferencedArms.push(armament);
            }
          });
        await ArmamentCategory.insertMany(backReferencedCategories);
        await Component.insertMany(backReferencedArms);
        return true;
    }

    static async createComponent(component) {
        return await Component.create(component);
    }

    static async updateComponent(component) {
        return await component.save();
    }
}

export default ComponentDAO;
