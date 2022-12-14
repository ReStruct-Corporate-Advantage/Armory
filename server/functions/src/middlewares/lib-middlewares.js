import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import logger from "./../loaders/logs-loader.js";
import docs from "../docs/index.js";
import CONSTANTS from "../constants/constants.js";

function injectLibMW(app) {
  logger.info(
      "[InjectLibMiddleware::init] Initializing library middlewares: express bodyParser, cors, cookieParser, swagger; in that order",
  );
  const whitelist = [
    "http://localhost:7992",
    "https://armory-server.web.app",
    "http://armory-server.web.app",
    "https://armory-server.firebaseapp.com",
    "http://armory-server.firebaseapp.com",
    "https://restruct-corporate-advantage.github.io",
    "https://www.armco.tech",
    "https://armco.tech",
    "http://www.armco.tech",
    "http://armco.tech",
  ];
  const corsOptions = {
    origin: (origin, callback) => {
      logger.info(
          "[InjectLibMiddleware::init::corsorigin] Received a call from: " +
          origin,
      );
      logger.info(
          "[InjectLibMiddleware::init::corsorigin] Origin Check: " +
          (!origin || whitelist.indexOf(origin) !== -1),
      );
      logger.info(
          "[InjectLibMiddleware::init::corsorigin] Checking against: " + whitelist,
      );
      !origin || whitelist.indexOf(origin) !== -1 ?
        () => {
          logger.info("[InjectLibMiddleware::init::corsorigin] Origin verified successfully, proceeding to next...")
          callback(null, true)
        } :
        callback(new Error("Not allowed by CORS"));
      logger.info(
          "[InjectLibMiddleware::init::corsorigin] CORS intercepter ended",
      );
    },
    credentials: true,
  };
  const swaggerDocs = swaggerJSDoc(docs);
  // console.log(JSON.stringify(docs, null, 4));
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  logger.info("[InjectLibMiddleware::init] Whitelisted Clients: " + whitelist);
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
  app.use((req, res, next) => {
    req.url = req.url.startsWith(CONSTANTS.APP_ROOT) ? req.url.substring(CONSTANTS.APP_ROOT.length) : req.url;
    req.url = !req.url ? "/" : req.url;
    next();
  });
}

export default injectLibMW;
