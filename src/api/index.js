import express from 'express';
import BlogReqController from "./blogreq/BlogReqController";

const api = express.Router();

api.get('/blogs/check', BlogReqController.exists);
api.post('/blogreqs', BlogReqController.create);

export default api;