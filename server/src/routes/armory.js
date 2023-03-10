import express from "express";
import authInterceptor from "../interceptors/authInterceptor.js";
import Controller from "../controllers/armory.js";
const controller = new Controller();
// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/", authInterceptor, controller.getArms);
/**
 * @swagger
 * /armory/bulk:
 *  post:
 *      description: Use to fetch armory documents
 *      responses:
 *          '200':
 *              description: "Successfully retrieved armory documents"
 */
router.post("/bulk", authInterceptor, controller.setArmaments);
/**
 * @swagger
 * /armory:
 *  post:
 *      description: Use to fetch armory documents
 *      responses:
 *          '200':
 *              description: "Successfully retrieved armory documents"
 */
router.post("/", authInterceptor, controller.createArmament);
router.put("/", authInterceptor, controller.updateArmament);

export default router;
