import winston from "winston";
import path from 'path';
import 'winston-daily-rotate-file';

const env = process.env.NODE_ENV || "dev";

const {combine, timestamp, printf} = winston.format;

const format = printf(({level, message, timestamp}) => {
    return `${timestamp} ${level}: ${message}`;
});

const options = {
    file: {
        level: 'info',
        filename: path.join(__dirname, '/../../logs/%DATE%-logfile.log'),
        datePattern: 'YYYY-MM-DD',
        prepend: true,
        json: false,
        colorize: false,
        maxFiles: "14d",
        format: combine(timestamp(), format)
    },
    console: {
        level: 'debug',
        json: false,
        colorize: true,
        format: combine(timestamp(), format)
    }
};

const logger = new winston.createLogger({
    transports: [
        new winston.transports.DailyRotateFile(options.file)
    ],
    exitOnError: false
});

if (env === "dev") {
    logger.add(new winston.transports.Console(options.console));
}

module.exports = logger;