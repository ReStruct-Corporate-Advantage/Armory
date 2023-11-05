/* eslint-disable import/first */
import express from "express";
import http from "http";
import {default as rootInit} from '@armco/node-starter-kit';
import injectRouteMW from "./src/middlewares/route-middlewares.js";

const app = express();

// Basic middleware
try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    console.log(
        '[Server-Listen][POST-START] Attempting hook up Armco looger,' +
        ' DB and Socket connection',
    );
    rootInit.default(app, new http.Server(app));
    console.log(
        '[Server-Listen][POST-START] Armco logger, DB,' +
        ' Socket initialized successfully',
    );
    } catch (e) {
    console.error(
        '[Server-Listen][POST-START] Failed to initialize Armco' +
        ' logger, DB, Socket initialized successfully',
    );
    console.error(e);
}

injectRouteMW(app);

const listenPort = process.env.PORT || ARMORY.appConfig?.app?.port
app.listen(listenPort, () => {
    console.log(`App running on the port ${listenPort}`);
})