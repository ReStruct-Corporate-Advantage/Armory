import {readFile} from "fs";
import userDao from "../dao/user.js";
import dao from "../dao/component.js";
import armoryDao from "../dao/armory.js";
import logger from "../loaders/logs-loader.js";
import Helper from "../utils/helper.js";
import { GET_FOR_CURRENT_USER_AND_PUBLIC_REPO, GET_FOR_CURRENT_USER, GET_USER_CONTROLS } from "../constants/queries.js";

class ComponentController {
  constructor() {
    this.getCurrentUserComponents = this.getCurrentUserComponents.bind(this);
    this.getComponents = this.getComponents.bind(this);
    this.createComponent = this.createComponent.bind(this);
    this.updateComponent = this.updateComponent.bind(this);
  }

  getCurrentUserComponents(req, res) {
    const user_details = req.decoded;
    const withPublicComponents = req.query.withPublic;
    try {
      logger.info("[ComponentController::getCurrentUserComponents] Initiating Components Retrieval");
      userDao.findUserByUserName(user_details.username).then((userObj) => {
        if (!userObj) {
          return res.status(404).json({message: "User not found!"});
        }
        armoryDao
            .getArmsCategories(withPublicComponents ? GET_FOR_CURRENT_USER_AND_PUBLIC_REPO(user_details.username) : GET_USER_CONTROLS)
            .then((categories) => {
              if (!categories) {
                return res
                    .status(404)
                    .json({
                      message: "No components available in your repository!",
                      error: true,
                      code: "ERR_DB_OR_QUERY_FAILURE",
                    });
              }
              logger.info(
                  "[ComponentController::getCurrentUserComponents] Receiving Armament Categories from DB",
              );
              logger.info(
                  "[ComponentController::getCurrentUserComponents] Processing Armament Categories",
              );
              const categoryPromises = [];
              const subCategories = [];
              categories &&
              categories.forEach((category) => {
                category.items &&
                  categoryPromises.push(
                      dao.populateComponentsInCategories(category, (withPublicComponents ? GET_FOR_CURRENT_USER_AND_PUBLIC_REPO : GET_FOR_CURRENT_USER)(user_details.username)),
                  );
              });
              Promise.all(categoryPromises).then((categories) => {
                categories &&
                categories.forEach((category) => {
                  if (category.armamentCategory) {
                    const parentObj = categories.find((categoryInner) => {
                      return (
                        String(category.armamentCategory) ===
                        String(categoryInner._id)
                      );
                    });
                    if (parentObj) {
                      const itemIndex =
                        parentObj.items &&
                        parentObj.items.findIndex(
                            (item) => String(item._id) === String(category._id),
                        );
                      parentObj.items &&
                        (parentObj.items[itemIndex] = category);
                      subCategories.push(categories.indexOf(category));
                    }
                  }
                });
                subCategories.sort((a, b) => a - b);
                if (!withPublicComponents && categories[0].items.length === 0) {
                  categories.splice(0, 1);
                }
                for (let i = subCategories.length - 1; i >= 0; i--) {
                  categories.splice(subCategories[i], 1);
                }
                categories.sort((cat1, cat2) => cat1.order - cat2.order);
                const responseObj = Helper.filterEach(categories, [
                  "_id",
                  "__v",
                  "leafCategory",
                ]);
                logger.info(
                    "[ComponentController::getCurrentUserComponents] Completed processing Armament Categories",
                );
                logger.info(
                    "[ComponentController::getCurrentUserComponents] Completed Components Retrieval",
                );
                return res.status(200).json(responseObj);
              });
            })
            .catch((e) => {
              logger.error(
                  "[ComponentController::getCurrentUserComponents] Error Occurred during arms category retrieval: ",
                  e,
              );
              res
                  .status(500)
                  .json({
                    message:
                  "Unable to fetch list of components at the moment, please try back in sometime or use the Contact Us option to report!",
                  });
            });
      });
    } catch (e) {
      logger.error(
          `[ComponentController::getCurrentUserComponents] An unknown error occurred while trying to fetch armament categories for ${user_details.username}`,
      );
      console.error(e);
      res
          .status(520)
          .json({
            error: `An unknown error occurred while trying to get list of components for ${user_details.username}`,
          });
    }
  }

  getComponents(req, res) {
    const user_details = req.decoded;
    try {
      logger.info("[ComponentController::getComponents] Initiating Components Retrieval");
      userDao.findUserByUserName(user_details.username).then((userObj) => {
        if (!userObj) {
          return res.status(404).json({ message: "User not found!" });
        }
        dao
          .getComponents()
          .then(components => {
            if (!components) {
              return res
                .status(404)
                .json({
                  message: "No components available in your repository!",
                  error: true,
                  code: "ERR_DB_OR_QUERY_FAILURE",
                });
            }
            logger.info(
              "[ComponentController::getComponents] Fetched Components from DB",
            );
            logger.info(
              "[ComponentController::getComponents] Returning Components",
            );
            return res.status(200).json(components);
          })
          .catch((e) => {
            logger.error(
              "[ComponentController::getComponents] Error Occurred during components retrieval: ",
              e,
            );
            res
              .status(500)
              .json({
                message:
                  "Unable to fetch list of components at the moment, please try back in sometime or use the Contact Us option to report!",
              });
          });
      });
    } catch (e) {
      logger.error(
        `[ComponentController::getComponents] An unknown error occurred while trying to fetch components for ${user_details.username}`,
      );
      console.error(e);
      res
        .status(520)
        .json({
          error: `An unknown error occurred while trying to get list of components for ${user_details.username}`,
        });
    }
  }

  populateComponents(req, res) {
    try {
      const user_details = req.decoded;
      readFile("./src/data/armory.json", "utf8", function(err, data) {
        logger.info(data);
        logger.info(err)
        if (err) {
          return res.json(err);
        }
        const arms = JSON.parse(data).types;
        arms && dao.bulkInsert(arms, user_details.username, null, true);
        return res.json({success: true}).status(200);
      });
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   *
   * Controller to create new component record
   *
   * @param req
   * @param res
   * @returns
   */
  async createComponent(req, res) {
    const user_details = req.decoded;
    logger.info(req.body)
    logger.info(
      `[ComponentController::createComponent] Creating component named ${req.body.name}, requested by user: ${user_details.username}`,
    );
    try {
      let component = req.body;
      component.meta = component.meta || {};
      component.meta.createdBy = user_details.username;
      component.meta.updatedBy = user_details.username;
      component.owner = user_details.username
      const createdRecord = await dao.createComponent(component);
      if (createdRecord) {
        logger.info(
          `[ComponentController::createComponent] Finished creating component named ${req.body.componentName}, requested by user: ${user_details.username}`,
        );
        const responseObj = JSON.parse(JSON.stringify(createdRecord));
        return res.json({ record: responseObj, success: true }).status(201);
      } else {
        logger.error(
          `[ComponentController::createComponent][DBException] Unable to create component named ${req.body.componentName}, requested by user: ${user_details.username}: `,
        );
        return res
          .json({
            message:
              "[DBException] An unknown error occurred while creating component",
          })
          .status(521);
      }
    } catch (e) {
      logger.error(
        `[ComponentController::createComponent][Exception] Unable to create component named ${req.body.componentName}, requested by user: ${user_details.username}: `,
        e,
      );
      return res
        .json({ error: e, message: "An unknown error occurred" })
        .status(521);
    }
  }

  updateComponent(req, res) {
    const user_details = req.decoded;
    try {
      userDao.findUserByUserName(user_details.username).then((userObj) => {
        if (!userObj) {
          return res.status(404).json({ message: "User not found!" });
        }
        const armament = req.body;
        dao.findArmamentByName(armament.componentName).then((doc) => {
          if (doc.freeze) {
            return res.status(403).json({ error: doc.displayName + " is a protected component and can not be edited!" });
          }
          doc.meta = armament.meta;
          doc.descriptor = armament.descriptor;
          doc.displayName = armament.displayName;
          dao.updateArmament(doc).then((res_db, err) => {
            if (err || !res_db) {
              return res
                .status(404)
                .json({ message: "Object to update not found!" });
            }
            return res.status(200).json(res_db);
          });
        });
      });
    } catch (e) {
      console.error(e);
      res
        .status(520)
        .json({
          error: `An unknown error occurred while trying to get list of armament for ${user_details.username}`,
        });
    }
  }

}

export default ComponentController;
