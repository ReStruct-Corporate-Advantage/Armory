import express from "express";
import Controller from "./../controllers/armory.js";
const controller = new Controller();
const router = express.Router();

router.get("/", controller.getArms);
// router.get("/image", controller.getImage);

export default router;