import express from 'express';
import {body, param, query} from 'express-validator';
import BlogController from './BlogController';
import {sendResponse, validate} from "../commons";

const blog = express.Router();

blog.post('/', [
    body(['url', 'feed.url']).isURL({protocols: ['http', 'https']}).withMessage('must be url'),
], validate, BlogController.createBlog, sendResponse);

blog.get('/', [
    query(['_start', '_end']).isInt({min: 0}).withMessage('must be positive'),
    query('_start')
        .custom((value, {req}) => parseInt(value) < parseInt(req.query._end))
        .withMessage('must be less than end'),
    query('_sort').not().isEmpty().withMessage('must not be empty string'),
    query('_order').isIn(["ASC", "DESC"]).withMessage('must be "ASC" or "DESC"'),
], validate, BlogController.getList, sendResponse);

blog.get('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
], validate, BlogController.getOne, sendResponse);

blog.put('/:id', [
    body('_id').isMongoId().withMessage('must be mongoId'),
    body(['feed.url', 'url']).isURL({protocols: ['http', 'https']}).withMessage('must be url'),
], validate, BlogController.update, sendResponse);

blog.delete('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
], validate, BlogController.delete, sendResponse);

export default blog;