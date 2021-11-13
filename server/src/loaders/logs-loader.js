import pkg from 'winston';
import "winston-mongodb";
const {createLogger, transports, format} = pkg;

export function logInit (callback) {
    return createLogger({
        transports: [
            new transports.File({
                filename: "armory.out.log",
                level: "info",
                format: format.combine(format.timestamp(), format.json())
            }),
            new transports.File({
                filename: "armory.error.log",
                level: "error",
                format: format.combine(format.timestamp(), format.json())
            }),
            new transports.Console({
                level: "info",
                format: format.combine(format.timestamp(), format.json())
            }),
            new transports.Console({
                level: "error",
                format: format.combine(format.timestamp(), format.json())
            }),
            new transports.MongoDB({
                level: "error",
                db: global.config ? global.config.db[process.env.NODE_ENV].connection_string : "mongodb+srv://mohiit1502:astalavista2402@armory.ergdp.mongodb.net/Armory?retryWrites=true&w=majority",
                options: {useNewUrlParser: true, useUnifiedTopology: true},
                collection: "ERROR_AUDIT",
                format: format.combine(format.timestamp(), format.json())
            })
        ]
    })
}
    
const logger = logInit();
export default logger;
