import express from "express";
import Controller from "./../controllers/auth.js";
const controller = new Controller();
const router = express.Router();

router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/logout", controller.logout);

export default router;