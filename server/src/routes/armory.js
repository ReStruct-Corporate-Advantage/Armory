import express from "express";
import authInterceptor from "./../interceptors/authInterceptor.js";
import Controller from "./../controllers/armory.js";
const controller = new Controller();
const router = express.Router();

router.get("/", authInterceptor, controller.getArms);
router.post("/", authInterceptor, controller.setArmaments);
router.put("/", authInterceptor, controller.updateArmament);

export default router;