import userDao from "../dao/user.js";
import dao from "../dao/project.js";
import logger from "../loaders/logs-loader.js";
import { GET_FOR_CURRENT_USER } from "../constants/queries.js";

class ProjectController {
  constructor() {
    this.getProjects = this.getProjects.bind(this);
    this.getCurrentUserProjects = this.getCurrentUserProjects.bind(this);
    this.createProject = this.createProject.bind(this);
    this.updateProject = this.updateProject.bind(this);
  }

  getCurrentUserProjects(req, res) {
    const user_details = req.decoded;
    try {
      logger.info("[ProjectController::getCurrentUserProjects] Initiating Projects Retrieval");
      userDao.findUserByUserName(user_details.username).then((userObj) => {
        if (!userObj) {
          return res.status(404).json({ message: "User not found!" });
        }
        dao
          .getProjects(GET_FOR_CURRENT_USER(user_details.username))
          .then(projects => {
            if (!projects) {
              return res
                .status(404)
                .json({
                  message: "No projects available in your repository!",
                  error: true,
                  code: "ERR_DB_OR_QUERY_FAILURE",
                });
            }
            logger.info(
              "[ProjectController::getCurrentUserProjects] Fetched Projects from DB",
            );
            logger.info(
              "[ProjectController::getCurrentUserProjects] Returning Projects",
            );
            return res.status(200).json(projects);
          })
          .catch((e) => {
            logger.error(
              "[ProjectController::getCurrentUserProjects] Error Occurred during projects retrieval: ",
              e,
            );
            res
              .status(500)
              .json({
                message:
                  "Unable to fetch list of projects at the moment, please try back in sometime or use the Contact Us option to report!",
              });
          });
      });
    } catch (e) {
      logger.error(
        `[ProjectController::getCurrentUserProjects] An unknown error occurred while trying to fetch projects for ${user_details.username}`,
      );
      console.error(e);
      res
        .status(520)
        .json({
          error: `An unknown error occurred while trying to get list of projects for ${user_details.username}`,
        });
    }
  }

  getProjects(req, res) {
    const user_details = req.decoded;
    try {
      logger.info("[ProjectController::getProjects] Initiating Projects Retrieval");
      userDao.findUserByUserName(user_details.username).then((userObj) => {
        if (!userObj) {
          return res.status(404).json({ message: "User not found!" });
        }
        dao
          .getProjects()
          .then(projects => {
            if (!projects) {
              return res
                .status(404)
                .json({
                  message: "No projects available in your repository!",
                  error: true,
                  code: "ERR_DB_OR_QUERY_FAILURE",
                });
            }
            logger.info(
              "[ProjectController::getProjects] Fetched Projects from DB",
            );
            logger.info(
              "[ProjectController::getProjects] Returning Projects",
            );
            return res.status(200).json(projects);
          })
          .catch((e) => {
            logger.error(
              "[ProjectController::getProjects] Error Occurred during projects retrieval: ",
              e,
            );
            res
              .status(500)
              .json({
                message:
                  "Unable to fetch list of projects at the moment, please try back in sometime or use the Contact Us option to report!",
              });
          });
      });
    } catch (e) {
      logger.error(
        `[ProjectController::getProjects] An unknown error occurred while trying to fetch projects for ${user_details.username}`,
      );
      console.error(e);
      res
        .status(520)
        .json({
          error: `An unknown error occurred while trying to get list of projects for ${user_details.username}`,
        });
    }
  }

  /**
   *
   * Controller to create new project record
   *
   * @param req
   * @param res
   * @returns
   */
  async createProject(req, res) {
    const user_details = req.decoded;
    logger.info(req.body)
    logger.info(
      `[ProjectController::createProject] Creating project named ${req.body.name}, requested by user: ${user_details.username}`,
    );
    try {
      let project = req.body;
      project.meta = project.meta || {};
      project.meta.createdBy = user_details.username;
      project.meta.updatedBy = user_details.username;
      project.owner = user_details.username
      const createdRecord = await dao.createProject(project);
      if (createdRecord) {
        logger.info(
          `[ProjectController::createProject] Finished creating project named ${req.body.componentName}, requested by user: ${user_details.username}`,
        );
        const responseObj = JSON.parse(JSON.stringify(createdRecord));
        return res.json({ record: responseObj, success: true }).status(201);
      } else {
        logger.error(
          `[ProjectController::createProject][DBException] Unable to create project named ${req.body.componentName}, requested by user: ${user_details.username}: `,
        );
        return res
          .json({
            message:
              "[DBException] An unknown error occurred while creating project",
          })
          .status(521);
      }
    } catch (e) {
      logger.error(
        `[ProjectController::createProject][Exception] Unable to create project named ${req.body.componentName}, requested by user: ${user_details.username}: `,
        e,
      );
      return res
        .json({ error: e, message: "An unknown error occurred" })
        .status(521);
    }
  }

  updateProject(req, res) {
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

export default ProjectController;
