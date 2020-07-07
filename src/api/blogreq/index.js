import express from 'express';
import {body, param, query} from 'express-validator';
import BlogReqController from './BlogReqController';
import {validate} from "../commons";

const STATUSES = ["Unhandled", "Denied", "Suspended", "Registered"];

const blogreq = express.Router();

blogreq.post('/', [
    body("url").isURL({protocols: ['http', 'https']}).withMessage('must be url'),
], validate, BlogReqController.create);

blogreq.get('/', [
    query(['_start', '_end']).optional().isInt({min: 0}).withMessage('must be positive'),
    query('_start')
        .optional()
        .custom((value, {req}) => parseInt(value) < parseInt(req.query._end))
        .withMessage('must be less than end'),
    query('_sort').optional().not().isEmpty().withMessage('must not be empty string'),
    query('_order').optional().isIn(["ASC", "DESC"]).withMessage('must be "ASC" or "DESC"'),
    query('status').optional()
        .isIn(STATUSES).withMessage('must be in "Unhandled", "Denied", "Suspended", "Registered"')
], validate, BlogReqController.getList);

blogreq.get('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
], validate, BlogReqController.getOne);

blogreq.put('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
    body('url').isURL({protocols: ['http', 'https']}).withMessage('must be url'),
    body('status').isIn(STATUSES).withMessage('must be in "Unhandled", "Denied", "Suspended", "Registered"'),
    body('feed.url').optional()
        .if(body('status').equals("Registered"))
        .isURL({protocols: ['http', 'https']}).withMessage('must be url'),
], validate, BlogReqController.update);

blogreq.delete('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
], validate, BlogReqController.delete);

export default blogreq;