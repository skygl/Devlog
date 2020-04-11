import express from 'express';
import BlogController from './BlogController';

const blog = express.Router();

blog.post('/', BlogController.createBlog);

export default blog;