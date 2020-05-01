import winston from "winston";
import path from 'path';
import moment from "moment";
import 'winston-daily-rotate-file';

const env = process.env.NODE_ENV || "dev";

const {printf} = winston.format;

const format = printf(({level, message}) => {
    return `${tsFormat()} ${level}: ${message}`;
});

const tsFormat = () => {
    return moment().format('YYYY-MM-DDT HH:mm:ss:SSS');
};

const options = {
    file: {
        level: 'info',
        filename: path.join(__dirname, '/../../logs/%DATE%-logfile.log'),
        datePattern: 'YYYY-MM-DD',
        prepend: true,
        json: false,
        colorize: false,
        maxFiles: "14d",
        format: format
    },
    console: {
        level: 'debug',
        json: false,
        colorize: true,
        format: format
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