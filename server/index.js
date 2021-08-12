/* eslint-disable import/first */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// import path, {dirname} from "path";
// import { fileURLToPath } from 'url';
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";

import APP_CONFIG from "./src/config/app-config.js";
import DB_CONFIG from "./src/config/db-config.js";
import AUTH_CONFIG from "./src/secrets/auth.js";
import KEYS from "./src/secrets/keys.js";
import CONSTANTS from "./src/constants/constants.js";

import dbInit from "./src/loaders/db-loader.js";
import {logInit} from "./src/loaders/logs-loader.js";
import armory from "./src/routes/armory.js";
import auth from "./src/routes/auth.js";
import user from "./src/routes/user.js";
import nlp from "./src/routes/nlp.js";
import project from "./src/routes/project.js";
import page from "./src/routes/page.js";
import component from "./src/routes/component.js";

const app = express();
const server = http.Server(app);
const io = require("socket.io")(server);
// const __dirname = dirname(fileURLToPath(import.meta.url));

global.config = {...global.config, ...APP_CONFIG};
global.config.db = DB_CONFIG;
global.config.auth = AUTH_CONFIG;
global.keys = KEYS;
global.constants = CONSTANTS

logInit();
const db = dbInit(logInit);

app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,UPDATE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    next();
});
app.use(cors())
app.use(cookieParser())
// app.use(express.static(path.resolve(__dirname, '../build')));

// app.get('*', function(request, response) {
//     response.sendFile(path.resolve(__dirname, '../build', 'index.html'));
// });
app.get("/test", (req, res) => {
    res.send(require("./src/data/armory.json"));
})

app.get("/", (req, res) => {
    res.send("Hello User!");
})
app.use("/api/armory", armory);
app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/nlp", nlp);
app.use("/api/project", project);
app.use("/api/page", page);
app.use("/api/component", component); // restructure armory to return only armory list without descriptors

global.db = db;

io.on("connection", function(socket) {
    console.log("A user connected");

    //Whenever someone disconnects this piece of code executed
    socket.on("disconnect", function () {
        console.log("A user disconnected");
    });
});

const listenPort = process.env.PORT || global.config.web.port
server.listen(listenPort, () => {
    console.log(`App running on the port ${listenPort}`);
})