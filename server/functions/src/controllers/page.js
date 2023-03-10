import userDao from "../dao/user.js";
import dao from "../dao/page.js";
import logger from "../loaders/logs-loader.js";
import { GET_FOR_CURRENT_USER, GET_FOR_CURRENT_USER_AND_PUBLIC_REPO } from "../constants/queries.js";

class PageController {
  constructor() {
    this.getCurrentUserPages = this.getCurrentUserPages.bind(this);
    this.getPages = this.getPages.bind(this);
    this.createPage = this.createPage.bind(this);
    this.updatePage = this.updatePage.bind(this);
  }

  getCurrentUserPages(req, res) {
    const user_details = req.decoded;
    const withPublicPages = req.query.withPublic;
    try {
      logger.info("[PageController::getCurrentUserPages] Initiating Pages Retrieval");
      userDao.findUserByUserName(user_details.username).then((userObj) => {
        if (!userObj) {
          return res.status(404).json({ message: "User not found!" });
        }
        dao
          .getPages((withPublicPages ? GET_FOR_CURRENT_USER_AND_PUBLIC_REPO : GET_FOR_CURRENT_USER)(user_details.username))
          .then(pages => {
            if (!pages) {
              return res
                .status(404)
                .json({
                  message: "No pages available in your repository!",
                  error: true,
                  code: "ERR_DB_OR_QUERY_FAILURE",
                });
            }
            logger.info(
              "[PageController::getCurrentUserPages] Fetched Pages from DB",
            );
            logger.info(
              "[PageController::getCurrentUserPages] Returning Pages",
            );
            return res.status(200).json(pages);
          })
          .catch((e) => {
            logger.error(
              "[PageController::getCurrentUserPages] Error Occurred during pages retrieval: ",
              e,
            );
            res
              .status(500)
              .json({
                message:
                  "Unable to fetch list of pages at the moment, please try back in sometime or use the Contact Us option to report!",
              });
          });
      });
    } catch (e) {
      logger.error(
        `[PageController::getCurrentUserPages] An unknown error occurred while trying to fetch pages for ${user_details.username}`,
      );
      console.error(e);
      res
        .status(520)
        .json({
          error: `An unknown error occurred while trying to get list of pages for ${user_details.username}`,
        });
    }
  }

  populatePages(req, res) {
    
  }
 
  getPages(req, res) {
    const user_details = req.decoded;
    try {
      logger.info("[PageController::getPages] Initiating Pages Retrieval");
      userDao.findUserByUserName(user_details.username).then((userObj) => {
        if (!userObj) {
          return res.status(404).json({ message: "User not found!" });
        }
        dao
          .getPages()
          .then(pages => {
            if (!pages) {
              return res
                .status(404)
                .json({
                  message: "No pages available in your repository!",
                  error: true,
                  code: "ERR_DB_OR_QUERY_FAILURE",
                });
            }
            logger.info(
              "[PageController::getPages] Fetched Pages from DB",
            );
            logger.info(
              "[PageController::getPages] Returning Pages",
            );
            return res.status(200).json(pages);
          })
          .catch((e) => {
            logger.error(
              "[PageController::getPages] Error Occurred during pages retrieval: ",
              e,
            );
            res
              .status(500)
              .json({
                message:
                  "Unable to fetch list of pages at the moment, please try back in sometime or use the Contact Us option to report!",
              });
          });
      });
    } catch (e) {
      logger.error(
        `[PageController::getPages] An unknown error occurred while trying to fetch pages for ${user_details.username}`,
      );
      console.error(e);
      res
        .status(520)
        .json({
          error: `An unknown error occurred while trying to get list of pages for ${user_details.username}`,
        });
    }
  }

  /**
   *
   * Controller to create new page record
   *
   * @param req
   * @param res
   * @returns
   */
  async createPage(req, res) {
    const user_details = req.decoded;
    logger.info(req.body)
    logger.info(
      `[PageController::createPage] Creating page named ${req.body.name}, requested by user: ${user_details.username}`,
    );
    try {
      let page = req.body;
      page.meta = page.meta || {};
      page.meta.createdBy = user_details.username;
      page.meta.updatedBy = user_details.username;
      page.owner = user_details.username
      const createdRecord = await dao.createPage(page);
      if (createdRecord) {
        logger.info(
          `[PageController::createPage] Finished creating page named ${req.body.componentName}, requested by user: ${user_details.username}`,
        );
        const responseObj = JSON.parse(JSON.stringify(createdRecord));
        return res.json({ record: responseObj, success: true }).status(201);
      } else {
        logger.error(
          `[PageController::createPage][DBException] Unable to create page named ${req.body.componentName}, requested by user: ${user_details.username}: `,
        );
        return res
          .json({
            message:
              "[DBException] An unknown error occurred while creating page",
          })
          .status(521);
      }
    } catch (e) {
      logger.error(
        `[PageController::createPage][Exception] Unable to create page named ${req.body.componentName}, requested by user: ${user_details.username}: `,
        e,
      );
      return res
        .json({ error: e, message: "An unknown error occurred" })
        .status(521);
    }
  }

  updatePage(req, res) {
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

export default PageController;
