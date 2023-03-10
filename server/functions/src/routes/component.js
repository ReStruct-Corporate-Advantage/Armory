import express from "express";
import authInterceptor from "../interceptors/authInterceptor.js";
import Controller from "../controllers/component.js";
const controller = new Controller();
const router = express.Router();

/**
 * @swagger
 * /api/component/current:
 *  post:
 *      description: Used to fetch components associated with the logged in user
 *      responses:
 *          '200':
 *              description: "Successfully fetched list of components"
 */
router.get("/current", authInterceptor, controller.getCurrentUserComponents);

/**
 * @swagger
 * /api/component:
 *  post:
 *      description: Used to fetch all components when required for administration
 *      responses:
 *          '200':
 *              description: "Successfully fetched list of components"
 */
router.get("/", authInterceptor, controller.getComponents);
/**
 * @swagger
 * /api/component:
 *  post:
 *      description: Use to create a new component
 *      responses:
 *          '200':
 *              description: "Successfully Created the component"
 */
router.post("/", authInterceptor, controller.createComponent);
router.put("/", authInterceptor, controller.updateComponent);

export default router;
