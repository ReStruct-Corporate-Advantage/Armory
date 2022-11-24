import injectLibMW from "./lib-middlewares.js";
import injectRouteMW from "./route-middlewares.js";

function injectMiddlewares(app) {
  injectLibMW(app);
  injectRouteMW(app);
}

export default injectMiddlewares;
