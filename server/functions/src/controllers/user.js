import dao from "../dao/user.js";
import Helper from "../utils/helper.js";
import logger from "../loaders/logs-loader.js";

class UserController {
  getCurrentUser(req, res) {
    const user_details = req.decoded;
    try {
      dao
          .findUserByUserName(user_details.username)
          .then((res_db) => {
            if (!res_db) {
              return res.status(404).json({message: "User not found!"});
            }
            const responseObj = Helper.filterObject(res_db, ["_id", "__v"]);
            return res.status(200).json(responseObj);
          })
          .catch((e) =>
            res
                .status(500)
                .json({message: "Unable to fetch the logged in user currently!"}),
          );
    } catch (e) {
      console.error(e);
      res
          .status(520)
          .json({
            error: `An unknown error occurred while trying to get user details for ${user_details.username}`,
          });
    }
  }

  getAllUsers(req, res) {
    dao
        .getAllUsers()
        .then((res_db) => res.json(res_db))
        .catch((e) =>
          res
              .status(500)
              .json({message: "Unable to get list of users currently"}),
        );
  }

  async getUserUniqueness(req, res) {
    if (!req.query.username && !req.query.email) {
      logger.error("[UserController::getUserUniqueness] Missing required parameter in request!");
      res.send(422).json({error: "Missing required parameter!"});
    }
    try {
      const isEmailCheck = !!req.query.email;
      isEmailCheck
        ? logger.info("[UserController::getUserUniqueness] Initiating email uniqueness check for: ", req.query.email)
        : logger.info("[UserController::getUserUniqueness] Initiating username uniqueness check for: ", req.query.username);
      const uniquenessStatus = isEmailCheck ? await dao.checkEmailUnique({email: req.query.email}) : await dao.checkUserUnique({username: req.query.username});
      logger.info("[UserController::getUserUniqueness] Returning uniqueness status %s for the input candidate: %s", uniquenessStatus, isEmailCheck ? req.query.email : req.query.username);
      res.status(200).json({uniquenessStatus});
    } catch (e) {
      logger.error("[UserController::getUserUniqueness] Uniqueness check failed for the user: ", req.query.username);
      logger.error("[UserController::getUserUniqueness] Captured error: ", e);
      res.status(520).json({error: "Unable to check user's uniqueness at the moment!"});
    }
  }
}

export default UserController;
