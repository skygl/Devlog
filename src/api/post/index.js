import express from 'express';
import PostController from "./PostController";

const post = express.Router();

post.get('/', PostController.getList);
post.get('/:id', PostController.getOne);
post.put('/:id', PostController.update);

export default post;