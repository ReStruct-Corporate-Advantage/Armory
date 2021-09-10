import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "./../loaders/logs-loader.js";

function injectLibMW (app) {
    logger.info("[InjectLibMiddleware::init] Initializing library middlewares: bodyParser, cors, cookieParser; in that order");
    app.use(bodyParser.json());
    var whitelist = ['http://localhost:7992', 'https://armory-ui.herokuapp.com']
    logger.info("[InjectLibMiddleware::init] Whitelisted Clients: http://localhost:7992, https://armory-ui.herokuapp.com");
    var corsOptions = {
        origin: (origin, callback) => {
            logger.info("[InjectLibMiddleware::init::corsorigin] Received a call from: ", origin)
            logger.info("[InjectLibMiddleware::init::corsorigin] Checking against: http://localhost:7992, https://armory-ui.herokuapp.com");
            whitelist.indexOf(origin) !== -1 ? callback(null, true) :  callback(new Error('Not allowed by CORS'))
            logger.info("[InjectLibMiddleware::init::corsorigin] CORS intercepter ended");
        },
        credentials: true
    }
    app.use(cors(corsOptions))
    app.use(cookieParser())
}

export default injectLibMW;