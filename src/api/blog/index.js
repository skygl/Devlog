import express from 'express';
import BlogController from './BlogController';

const blog = express.Router();

blog.post('/', BlogController.createBlog);
blog.get('/', BlogController.getList);
blog.get('/:id', BlogController.getOne);
blog.put('/:id', BlogController.update);
blog.delete('/:id', BlogController.delete);

export default blog;