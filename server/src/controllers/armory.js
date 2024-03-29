import {readFile} from "fs";
import Helper from "../utils/helper.js";
import userDao from "../dao/user.js";
import dao from "../dao/armory.js";

class ArmoryController {
  getArms(req, res) {
    const user_details = req.decoded;
    try {
      logger.info("[ArmoryController::getArms] Initiating Arms Retrieval");
      userDao.findUserByUserName(user_details.username).then((userObj) => {
        if (!userObj) {
          return res.status(404).json({message: "User not found!"});
        }
        dao
            .getArmsCategories()
            .then((categories) => {
              if (!categories) {
                return res
                    .status(404)
                    .json({
                      message: "No arms available in your repository!",
                      error: true,
                      code: "ERR_DB_OR_QUERY_FAILURE",
                    });
              }
              logger.info(
                  "[ArmoryController::getArms] Receiving Armament Categories from DB",
              );
              logger.info(
                  "[ArmoryController::getArms] Processing Armament Categories",
              );
              const categoryPromises = [];
              const subCategories = [];
              categories &&
              categories.forEach((category) => {
                category.items &&
                  categoryPromises.push(
                      dao.populateArmaments(category, userObj),
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
                    "[ArmoryController::getArms] Completed processing Armament Categories",
                );
                logger.info(
                    "[ArmoryController::getArms] Completed Arms Retrieval",
                );
                return res.status(200).json(responseObj);
              });
            })
            .catch((e) => {
              logger.error(
                  "[ArmoryController::getArms] Error Occurred during arms category retrieval: ",
                  e,
              );
              res
                  .status(500)
                  .json({
                    message:
                  "Unable to fetch list of armaments at the moment, please try back in sometime or use the Contact Us option to report!",
                  });
            });
      });
    } catch (e) {
      logger.error(
          `[ArmoryController::getArms] An unknown error occurred while trying to fetch armament categories for ${user_details.username}`,
      );
      console.error(e);
      res
          .status(520)
          .json({
            error: `An unknown error occurred while trying to get list of armament for ${user_details.username}`,
          });
    }
  }

  setArmaments(req, res) {
    try {
      const user_details = req.decoded;
      readFile("./src/data/armory.json", "utf8", function(err, data) {
        if (err) {
          return res.json(err);
        }
        const arms = JSON.parse(data).types;
        arms && dao.bulkInsert(arms, user_details.username);
        return res.json({success: true}).status(200);
      });
    } catch (e) {
      logger.error(e);
    }
  }

  /**
   *
   * Controller to create new armament record, accepts
   *
   * @queryParam withContainer - Create a component with basic container configuration if true else create an empty component with no configuration
   * @param req
   * @param res
   * @returns
   */
  async createArmament(req, res) {
    const user_details = req.decoded;
    const queryParams = req.query;
    logger.info(
        `[ArmoryController::createArmament] Creating armament named ${req.body.componentName}, requested by user: ${user_details.username}`,
    );
    try {
      let armament = req.body;
      if (queryParams && queryParams.withContainer) {
        const container = await dao.findArmamentByName("Container");
        if (container) {
          armament.meta = {...container._doc.meta, ...armament.meta};
          armament = {...container._doc, ...armament};
          armament = JSON.parse(JSON.stringify(armament));
          delete armament._id;
        } else {
          logger.error(
              `[ArmoryController::createArmament][DBException] Error occurred while trying to get Container component, requested by user: ${user_details.username}: `,
          );
          return res
              .json({
                message:
                "[DBException] An unknown error occurred while fetching wrapper container",
              })
              .status(521);
        }
      }
      armament.createdAt = new Date();
      const createdRecord = await dao.createArmamentTransactional(armament);
      if (createdRecord) {
        logger.info(
            `[ArmoryController::createArmament] Finished creating armament named ${req.body.componentName}, requested by user: ${user_details.username}`,
        );
        const responseObj = JSON.parse(JSON.stringify(createdRecord));
        return res.json({record: responseObj, success: true}).status(201);
      } else {
        logger.error(
            `[ArmoryController::createArmament][DBException] Unable to create armament named ${req.body.componentName}, requested by user: ${user_details.username}: `,
        );
        return res
            .json({
              message:
              "[DBException] An unknown error occurred while creating armament",
            })
            .status(521);
      }
    } catch (e) {
      logger.error(
          `[ArmoryController::createArmament][Exception] Unable to create armament named ${req.body.componentName}, requested by user: ${user_details.username}: `,
          e,
      );
      return res
          .json({error: e, message: "An unknown error occurred"})
          .status(521);
    }
  }

  updateArmament(req, res) {
    const user_details = req.decoded;
    try {
      userDao.findUserByUserName(user_details.username).then((userObj) => {
        if (!userObj) {
          return res.status(404).json({message: "User not found!"});
        }
        const armament = req.body;
        dao.findArmamentByName(armament.componentName).then((doc) => {
          doc.meta = armament.meta;
          doc.descriptor = armament.descriptor;
          doc.displayName = armament.displayName;
          dao.updateArmament(doc).then((res_db, err) => {
            if (err || !res_db) {
              return res
                  .status(404)
                  .json({message: "Object to update not found!"});
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

export default ArmoryController;
