import mongoose from "mongoose";
import {ArmamentCategory} from "../models/armamentCategory.js";
import {Armament} from "../models/armory.js";
import CONSTANTS from "../constants/constants.js";

class ArmoryDAO {
  static async findArmamentById(_id) {
    return await Armament.find({_id});
  }

  static async findArmamentByName(componentName) {
    return await Armament.findOne({componentName});
  }

  static async findArmamentCategoryById(_id) {
    return await ArmamentCategory.find({_id});
  }

  static async findArmamentCategoryByName(name) {
    return await ArmamentCategory.findOne({name});
  }

  static async getArmsCategories() {
    return await ArmamentCategory.find().lean();
  }
  /**
   * Gets armament objects corresponding to their ObjectIds in armament category and replaces IDs with objects in category.
   *
   * @param category
   * @returns
   */
  static async populateArmaments(category) {
    if (!category.leafCategory) {
      return category;
    }
    const armaments = await Armament.find({
      _id: {$in: category.items},
    }).lean();
    category.items = armaments;
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
          ArmoryDAO.bulkInsert(document.items, username, category, freeze);
        } else {
          document.armamentCategory = parentId;
          document.meta = document.meta ? document.meta : {};
          document.meta.createdBy = document.meta.createdBy ?
            document.meta.createdBy :
            username;
          document.freeze = freeze;
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

  static async createArmament(armament) {
    return await Armament.create(armament);
  }

  static async createArmamentTransactional(armament) {
    const session = await mongoose.startSession();
    session.startTransaction();
    let category = armament.armamentCategory;
    if (!category) {
      category = await ArmoryDAO.findArmamentCategoryByName(CONSTANTS.USER_CONTROL_CATEGORY_NAME);
      armament.armamentCategory = category._id;
      console.log(category);
    } else if (typeof armament.armamentCategory === "object") {
      armament.armamentCategory = category._id;
    }
    const createdArmament = await Armament.create(armament);
    category.items.push(createdArmament._id);
    console.log("before ending: ", createdArmament);
    await category.save();
    // also save to community controls
    if (armament.visibility && armament.visibility === "public") {
      category = await ArmoryDAO.findArmamentCategoryByName(CONSTANTS.COMMUNITY_CONTROL_CATEGORY_NAME);
      category.items.push(createdArmament._id);
      await category.save();
    }
    session.endSession();
    console.log("after ending: ", createdArmament);
    return createdArmament;
  }

  static async updateArmament(doc) {
    return await doc.save();
  }
}

export default ArmoryDAO;
