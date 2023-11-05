import {createRequire} from "module";
import Connection from "../sockets/messageHandler.js";
import logger from "./logs-loader.js";
const require = createRequire(import.meta.url);
const socketIO = require("socket.io");

function socketInit(server) {
  const io = socketIO(server, {
    cors: "*",
    methods: ["GET", "POST"],
  });
  logger.info("[Init::Sockets] Initializing Socket listeners");
  io.sockets.on("connection", (socket) => {
    logger.info("[Listener::Socket] A user connected");
    new Connection(io, socket);

    // Whenever someone disconnects this piece of code executed
    socket.on("disconnect", function() {
      logger.info("[Listener::Socket] A user disconnected");
    });
  });
}

export default socketInit;
