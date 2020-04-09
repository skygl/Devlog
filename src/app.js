import path from 'path';
import dotenv from 'dotenv';
import Server from './server';

dotenv.config({path: path.join(__dirname, '../.env')});
const PORT = process.env.NODE_PORT | 3000;

const server = new Server();
server.listen(PORT);