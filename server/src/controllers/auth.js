import jwt from "jsonwebtoken";
import dao from "./../dao/user.js";
import Helper from "./../utils/helper.js";

class AuthController {

    login (req, res) {
        const userdata = {
            username: req.body.username,
            password: req.body.password
        };
        try {
            dao.findUserByUserName(userdata.username)
                .then(res_db => {
                    if (res_db) {
                        let token = jwt.sign(userdata, global.config.auth.secretKey, {
                            algorithm: global.config.auth.algorithm,
                            expiresIn: "21600m" // 15 days
                        });
                        res.cookie("auth_session_token", token, {maxAge: 1000 * 60 * 60 * 24 * 30, domain: ".herokuapp.com", path: "/", sameSite: "Lax"});
                        res.cookie("auth_session_user", userdata.username, {maxAge: 1000 * 60 * 60 * 24 * 30, domain: ".herokuapp.com", path: "/", sameSite: "Lax"});

                        res.status(200).json({message: "Login Successful", user: res_db});
                    } else {
                        res.status(401).json({error: "Username or password is incorrect"});
                    }
                })
                .catch(e => {
                    res.status(520).json({error: "Unable to login at the moment"});
                })
        } catch (e) {
            console.error(e);
            res.status(520).json({error: "Unable to login at the moment"});
        }
    }

    resetPassword (req, res) {

    }

    register (req, res) {
        const userdata = {
            username: req.body.username,
            newpassword: req.body.newpassword,
            confirmpassword: req.body.confirmpassword
        };
        const writedata = {
            username: req.body.username,
            password: req.body.newpassword
        }
        try {
            if (Helper.validate(userdata, "register")) {
                dao.checkUserUnique({username: userdata.username})
                    .then(res_db_1 => {
                        if (res_db_1) {
                            dao.createUser(writedata)
                                .then(res_db_2 => {
                                    if (!res_db_2.errors) {
                                        return res.status(200).json({message: `User ${userdata.username} Registered Successfully, please continue to login.`});
                                    }
                                    return res.status(500).json({message: `Unable to save the user: ${userdata.username}, please try again in sometime.`})
                                })
                                .catch(e => {
                                    res.status(500).json({message: `Unable to save the user: ${userdata.username}, please try again in sometime.`})
                                })
                        } else {
                            res.status(520).json({error: `Username ${userdata.username} has already been taken!`});
                        }
                    })
                    .catch(e => res.status(500).json({message: `Username ${userdata.username} has already been taken!`, code: "UNIQUENESS_CHECK_FAILED"}));
            } else {
                res.status(500).json({error: `Data validation failed for the user ${userdata.username}`});
            }
        } catch (e) {
            console.error(e);
            res.status(520).json({error: "Unable to register at the moment"});
        }
    }

    logout (req, res) {
        res.cookie("auth_session_token", "", { expires: new Date() });
        res.cookie("auth_session_user", "", { expires: new Date() });
        res.status(200).json({message: "Logged out successfully, redirecting to login..."});
    }
}

export default AuthController;