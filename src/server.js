import express from 'express';

import blog from './api/blog/index';
import dom from './api/dom/index';

export default class Server {

    constructor() {
        this.app = express();
        this.route();
    }

    route() {
        const app = this.app;
        app.use(express.json({
            limit: "50mb"
        }));
        app.use('/blogs', blog);
        app.use('/doms', dom);
    }

    listen(port) {
        const app = this.app;
        app.listen(port, function () {
            console.log('Server is Listening to port ', port);
        });
    }
}