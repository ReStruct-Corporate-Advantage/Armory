import * as functions from "firebase-functions";
import app from "./initializer";

export const armoryServerApp = functions.https.onRequest(app);
