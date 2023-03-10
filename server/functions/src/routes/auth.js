import express from "express";
import Controller from "../controllers/auth.js";
const controller = new Controller();
// eslint-disable-next-line new-cap
const router = express.Router();

router.post("/login", controller.login);
router.post("/register", controller.register);
router.get("/logout", controller.logout);
router.post("/captchaVerify", controller.captchaVerify)

export default router;
