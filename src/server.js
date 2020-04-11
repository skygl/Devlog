import express from 'express';

import blog from './api/blog/index';

export default class Server {

    constructor() {
        this.app = express();
        this.route();
    }

    route() {
        const app = this.app;
        app.use(express.json());
        app.use('/blogs', blog);
    }

    listen(port) {
        const app = this.app;
        app.listen(port, function () {
            console.log('Server is Listening to port ', port);
        });
    }
}