import express from 'express';

export default class Server {

    constructor() {
        this.app = express();
    }

    listen(port) {
        const app = this.app;
        app.listen(port, function () {
            console.log('Server is Listening to port ', port);
        });
    }
}