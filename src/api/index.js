import express from 'express';
import BlogReqController from "./blogreq/BlogReqController";
import {validate} from "./commons";
import {body, query} from 'express-validator';

const api = express.Router();

api.get('/blogs/check', [
    query('url').isURL({protocols: ['http', 'https']}).withMessage('must be url'),
], validate, BlogReqController.exists);

api.post('/blogreqs', [
    body('url').isURL({protocols: ['http', 'https']}).withMessage('must be url'),
], validate, BlogReqController.create);

export default api;