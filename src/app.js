import Server from './server';
import './config/env';

const PORT = process.env.NODE_PORT | 3000;

const server = new Server();
server.listen(PORT);