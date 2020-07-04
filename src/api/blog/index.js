import express from 'express';
import BlogController from './BlogController';

const blog = express.Router();

blog.post('/', BlogController.createBlog);
blog.get('/', BlogController.getList);

export default blog;