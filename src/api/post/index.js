import express from 'express';
import PostController from "./PostController";

const post = express.Router();

post.get('/', PostController.getList);

export default post;