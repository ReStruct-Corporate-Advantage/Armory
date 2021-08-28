import express from "express";
import authInterceptor from "./../interceptors/authInterceptor.js";
import Controller from "./../controllers/user.js";
const controller = new Controller();
const router = express.Router();

router.get("/current", authInterceptor, controller.getCurrentUser);
router.get("/all", authInterceptor, controller.getAllUsers);

export default router;