import express from 'express';
import cors from 'cors';

import logger from './utils/Logger';
import blog from './api/blog/index';
import schedules from "./schedules/schedule";
import cron from 'node-cron';

export default class Server {

    constructor() {
        this.app = express();
        this.route();
        this.schedule();
    }

    route() {
        const app = this.app;
        app.use(cors());
        app.use(express.json({
            limit: "50mb"
        }));
        app.use('/blogs', blog);
    }

    listen(port) {
        const app = this.app;
        app.listen(port, function () {
            logger.info('Server is Listening to port ', port);
        });
    }

    schedule() {
        Object.values(schedules).forEach(target => {
            cron.schedule(target.frequency, target.job);
        })
    }
}