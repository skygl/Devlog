import express from 'express';
import cors from 'cors';

import logger from './utils/Logger';
import blog from './api/blog/index';
import blogreq from "./api/blogreq";
import schedules from "./schedules/schedule";
import cron from 'node-cron';
import post from "./api/post";
import auth from "./api/auth";
import {authorizeAdmin} from "./commons/auth";
import proxy from "./proxy";
import api from "./api";

export default class Server {

    constructor() {
        this.app = express();
        this.route();
        this.schedule();
    }

    route() {
        const app = this.app;
        app.use(cors({exposedHeaders: "X-Total-Count"}));
        app.use(express.json({
            limit: "50mb"
        }));
        app.use('/proxy', proxy);
        app.use(['/blogs', '/blogs/:id', '/posts:id', '/blogreqs', '/blogreqs:id'], authorizeAdmin);
        app.use('/blogs', blog);
        app.use('/blogreqs', blogreq);
        app.use('/posts', post);
        app.use('/', auth);
        app.use('/api', api);
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