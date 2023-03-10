import express from "express";
import authInterceptor from "../interceptors/authInterceptor.js";
import Controller from "../controllers/project.js";
const controller = new Controller();
const router = express.Router();

/**
 * @swagger
 * /api/project/current:
 *  post:
 *      description: Used to fetch projects associated with the logged in user
 *      responses:
 *          '200':
 *              description: "Successfully fetched list of projects"
 */
router.get("/current", authInterceptor, controller.getCurrentUserProjects);

/**
 * @swagger
 * /armory:
 *  post:
 *      description: Used to fetch projects associated with the logged in user
 *      responses:
 *          '200':
 *              description: "Successfully fetched list of projects"
 */
router.get("/", authInterceptor, controller.getProjects);
/**
 * @swagger
 * /armory:
 *  post:
 *      description: Use to create a new project
 *      responses:
 *          '200':
 *              description: "Successfully Created the project"
 */
router.post("/", authInterceptor, controller.createProject);
router.put("/", authInterceptor, controller.updateProject);

export default router;
