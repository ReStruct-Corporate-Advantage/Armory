import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import logger from "./../loaders/logs-loader.js";
import docs from "../../docs/index.js";

function injectLibMW (app) {
    logger.info("[InjectLibMiddleware::init] Initializing library middlewares: express bodyParser, cors, cookieParser, swagger; in that order");
    const whitelist = ["http://localhost:7992", "https://armory-ui.herokuapp.com", "http://armory-ui.herokuapp.com", "https://restruct-corporate-advantage.github.io"]
    const corsOptions = {
        origin: (origin, callback) => {
            logger.info("[InjectLibMiddleware::init::corsorigin] Received a call from: ", origin)
            logger.info("[InjectLibMiddleware::init::corsorigin] Checking against: http://localhost:7992, https://armory-ui.herokuapp.com");
            (!origin || whitelist.indexOf(origin) !== -1) ? callback(null, true) :  callback(new Error("Not allowed by CORS"))
            logger.info("[InjectLibMiddleware::init::corsorigin] CORS intercepter ended");
        },
        credentials: true
    }
    const swaggerDocs = swaggerJSDoc(docs);
    // console.log(JSON.stringify(docs, null, 4));
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    logger.info("[InjectLibMiddleware::init] Whitelisted Clients: http://localhost:7992, https://armory-ui.herokuapp.com");
    app.use(cors(corsOptions))
    app.use(cookieParser())
    app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
}

export default injectLibMW;
