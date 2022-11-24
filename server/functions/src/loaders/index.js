import APP_CONFIG from "../config/app-config.js";
import DB_CONFIG from "../config/db-config.js";
import AUTH_CONFIG from "../secrets/auth.js";
import KEYS from "../secrets/keys.js";
import CONSTANTS from "../constants/constants.js";

import dbInit from "./db-loader.js";
import {logInit} from "./logs-loader.js";
import socketInit from "./socket-loader.js";

function rootInit(server) {
  global.config = {...global.config, ...APP_CONFIG};
  global.config.db = DB_CONFIG;
  global.config.auth = AUTH_CONFIG;
  global.keys = KEYS;
  global.constants = CONSTANTS;

  logInit();
  socketInit(server);
  dbInit(logInit);
}

export default rootInit;
