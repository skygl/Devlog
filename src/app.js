import Server from './server';
import './config/env';
import './config/database';

const PORT = process.env.NODE_PORT | 3000;

const server = new Server();
server.listen(PORT);