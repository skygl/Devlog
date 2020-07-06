import express from 'express';
import BlogController from './blog/BlogController';

const api = express.Router();

api.get('/blogs/check', BlogController.exists);

export default api;