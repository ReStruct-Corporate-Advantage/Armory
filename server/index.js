/* eslint-disable import/first */
import express from "express";
import http from "http";
import rootInit from "./src/loaders/index.js";
import injectMiddlwares from "./src/middlewares/index.js"

const app = express();
const server = http.Server(app);

rootInit(server);
injectMiddlwares(app);

const listenPort = process.env.PORT || global.config.web.port
server.listen(listenPort, () => {
    console.log(`App running on the port ${listenPort}`);
})