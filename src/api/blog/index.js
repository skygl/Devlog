import express from 'express';
import {body, param, query} from 'express-validator';
import BlogController from './BlogController';
import {validate} from "../commons";

const blog = express.Router();

blog.post('/', [
    body(['url', 'feed.url']).isURL({protocols: ['http', 'https']}).withMessage('must be url'),
    body(['elements.from', 'post_regex']).not().isEmpty().withMessage('must not be empty string'),
], validate, BlogController.createBlog);

blog.get('/', [
    query(['_start', '_end']).optional().isInt({min: 0}).withMessage('must be positive'),
    query('_start')
        .optional()
        .custom((value, {req}) => parseInt(value) < parseInt(req.query._end))
        .withMessage('must be less than end'),
    query('_sort').optional().not().isEmpty().withMessage('must not be empty string'),
    query('_order').optional().isIn(["ASC", "DESC"]).withMessage('must be "ASC" or "DESC"'),
], validate, BlogController.getList);

blog.get('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
], validate, BlogController.getOne);

blog.put('/:id', [
    body('_id').isMongoId().withMessage('must be mongoId'),
    body(['elements.from', 'post_regex']).not().isEmpty().withMessage('must not be empty string'),
    body(['feed.url', 'url']).isURL({protocols: ['http', 'https']}).withMessage('must be url'),
], validate, BlogController.update);

blog.delete('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
], validate, BlogController.delete);

export default blog;