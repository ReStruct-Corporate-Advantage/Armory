import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";

function injectLibMW (app) {
    app.use(bodyParser.json());
    var whitelist = ['http://localhost:7992', 'https://armory-ui.herokuapp.com']
    var corsOptions = {
    origin: (origin, callback) => whitelist.indexOf(origin) !== -1 ? callback(null, true) :  callback(new Error('Not allowed by CORS')),
    credentials: true
    }
    app.use(cors(corsOptions))
    app.use(cookieParser())
}

export default injectLibMW;