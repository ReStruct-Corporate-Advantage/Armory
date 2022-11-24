import express, { Express } from 'express';
import dotenv from 'dotenv';
import rootInit from "./loaders";
import injectMiddlwares from "./middlewares";

dotenv.config();

const app: Express = express();
const port = process.env.APP_PORT || 3002;

injectMiddlwares(app);
const server = app.listen(port, () => {
  console.log(`App running on the port ${port}`);
});

rootInit(server);
export default app;
