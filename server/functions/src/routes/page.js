import express from "express";
import authInterceptor from "../interceptors/authInterceptor.js";
import Controller from "../controllers/page.js";
const controller = new Controller();
const router = express.Router();

/**
 * @swagger
 * /api/page/current:
 *  post:
 *      description: Used to fetch pages associated with the logged in user
 *      responses:
 *          '200':
 *              description: "Successfully fetched list of pages"
 */
router.get("/current", authInterceptor, controller.getCurrentUserPages);

/**
 * @swagger
 * /armory:
 *  post:
 *      description: Used to fetch pages associated with the logged in user
 *      responses:
 *          '200':
 *              description: "Successfully fetched list of pages"
 */
router.get("/", authInterceptor, controller.getPages);
/**
 * @swagger
 * /armory:
 *  post:
 *      description: Use to create a new page
 *      responses:
 *          '200':
 *              description: "Successfully Created the page"
 */
router.post("/", authInterceptor, controller.createPage);
router.put("/", authInterceptor, controller.updatePage);

export default router;
