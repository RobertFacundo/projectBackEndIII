import winston from "winston";
import dotenv from 'dotenv';
dotenv.config();

const logLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        fatal: 'bgRed',
        error: 'red',
        warning: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue',
    },
};

const logLevelForConsole = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

const logTransports = [
    new winston.transports.Console({
        level: logLevelForConsole,
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.simple()
        )
    })
];

if (process.env.NODE_ENV === 'production') {
    logTransports.push(
        new winston.transports.File({
            filename: 'errors.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        })
    );
}

const logger = winston.createLogger({
    levels: logLevels.levels,
    transports: logTransports,
});

winston.addColors(logLevels.colors);

export default logger;