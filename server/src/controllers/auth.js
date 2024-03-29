import jwt from "jsonwebtoken";
import dao from "../dao/user.js";
import Helper from "../utils/helper.js";

class AuthController {
  login(req, res) {
    logger.info(
        "[AuthController::login] Initiating login for the user: ",
        req.body.username,
    );
    const userdata = {
      username: req.body.username,
      password: req.body.password,
    };
    try {
      logger.info(
          "[AuthController::login] Finding details for the user %s in db",
          req.body.username,
      );
      dao
          .findUserByUserName(userdata.username)
          .then((res_db) => {
            logger.info(
                "[AuthController::login] DB search for the user %s completed",
                req.body.username,
            );
            if (res_db) {
              logger.info(
                  "[AuthController::login] User %s exists in db",
                  req.body.username,
              );
              if (userdata.password !== res_db.password) {
                logger.warn(
                    "[AuthController::login] User details for the user %s are incorrect",
                    req.body.username,
                );
                return res.status(401).send({
                  auth_session_token: null,
                  message: "Invalid Password!",
                });
              }
              logger.info(
                  "[AuthController::login] User credentials matched for the user: ",
                  req.body.username,
              );
              logger.info(
                  "[AuthController::login] Generating authentication token for the user: ",
                  req.body.username,
              );
              logger.info(
                  "[AuthController::login] Authentication token has been generated for the user: ",
                  req.body.username,
              );
              // res.cookie("auth_session_token", token, {maxAge: 1000 * 60 * 60 * 24 * 30, domain: "herokuapp.com", path: "/", sameSite: "none"});
              // res.cookie("auth_session_user", userdata.username, {maxAge: 1000 * 60 * 60 * 24 * 30, domain: "herokuapp.com", path: "/", sameSite: "none"});

              res
                  .status(200)
                  .json({
                    message: "Login Successful",
                    user: res_db,
                  });
              logger.info(
                  "[AuthController::login] Completed login for the user: ",
                  req.body.username,
              );
            } else {
              logger.warn(
                  "[AuthController::login] User %s not found in db",
                  req.body.username,
              );
              res.status(404).json({error: "User not found!"});
            }
          })
          .catch((e) => {
            logger.error(
                "[AuthController::login] Login failed for unknown reason for the user: ",
                req.body.username,
            );
            logger.error("[AuthController::login] Captured error: ", e);
            res.status(520).json({error: "Unable to login at the moment"});
          });
    } catch (e) {
      logger.error(e);
      res
          .status(520)
          .json({error: "Unable to login at the moment", message: e});
    }
  }

  resetPassword(req, res) {}

  register(req, res) {
    const userdata = {
      username: req.body.username,
      newpassword: req.body.newpassword,
      confirmpassword: req.body.confirmpassword,
    };
    const writedata = {
      username: req.body.username,
      password: req.body.newpassword,
    };
    try {
      if (Helper.validate(userdata, "register")) {
        dao
            .checkUserUnique({username: userdata.username})
            .then((res_db_1) => {
              if (res_db_1) {
                dao
                    .createUser(writedata)
                    .then((res_db_2) => {
                      if (!res_db_2.errors) {
                        return res
                            .status(200)
                            .json({
                              message: `User ${userdata.username} Registered Successfully, please continue to login.`,
                            });
                      }
                      return res
                          .status(500)
                          .json({
                            message: `Unable to save the user: ${userdata.username}, please try again in sometime.`,
                          });
                    })
                    .catch((e) => {
                      res
                          .status(500)
                          .json({
                            message: `Unable to save the user: ${userdata.username}, please try again in sometime.`,
                          });
                    });
              } else {
                res
                    .status(520)
                    .json({
                      error: `Username ${userdata.username} has already been taken!`,
                    });
              }
            })
            .catch((e) =>
              res
                  .status(500)
                  .json({
                    message: `Struggling to talk to DB`,
                    code: "CODE_RED",
                  }),
            );
      } else {
        res
            .status(500)
            .json({
              error: `Data validation failed for the user ${userdata.username}`,
            });
      }
    } catch (e) {
      logger.error(e);
      res.status(520).json({error: "Unable to register at the moment"});
    }
  }

  logout(req, res) {
    res.cookie("auth_session_token", "", {expires: new Date()});
    res.cookie("auth_session_user", "", {expires: new Date()});
    res
        .status(200)
        .json({message: "Logged out successfully, redirecting to login..."});
  }
}

export default AuthController;
