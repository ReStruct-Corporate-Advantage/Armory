import dao from "../dao/user.js";
import Helper from "../utils/helper.js";

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
}

export default UserController;
