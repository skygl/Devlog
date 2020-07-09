import express from 'express';
import {body, param, query} from 'express-validator';
import BlogReqController from './BlogReqController';
import {beginTransaction, endTransaction, sendResponse, validate} from "../commons";

const STATUSES = ["Unhandled", "Denied", "Suspended", "Registered"];

const blogreq = express.Router();

blogreq.post('/', [
    body("url").isURL({protocols: ['http', 'https']}).withMessage('must be url'),
], validate, BlogReqController.create, sendResponse);

blogreq.get('/', [
    query(['_start', '_end']).isInt({min: 0}).withMessage('must be positive'),
    query('_start')
        .custom((value, {req}) => parseInt(value) < parseInt(req.query._end))
        .withMessage('must be less than end'),
    query('_sort').not().isEmpty().withMessage('must not be empty string'),
    query('_order').isIn(["ASC", "DESC"]).withMessage('must be "ASC" or "DESC"'),
    query('status').optional()
        .isIn(STATUSES).withMessage('must be in "Unhandled", "Denied", "Suspended", "Registered"')
], validate, BlogReqController.getList, sendResponse);

blogreq.get('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
], validate, BlogReqController.getOne, sendResponse);

blogreq.put('/:id', (req, res, next) => {
    next();
}, [
    param('id').isMongoId().withMessage('must be mongoId'),
    body('url').isURL({protocols: ['http', 'https']}).withMessage('must be url'),
    body('status').isIn(STATUSES).withMessage('must be in "Unhandled", "Denied", "Suspended", "Registered"'),
    body('feed.url').optional()
        .if(body('status').equals("Registered"))
        .isURL({protocols: ['http', 'https']}).withMessage('must be url'),
], validate, beginTransaction, BlogReqController.update, endTransaction, sendResponse);

blogreq.delete('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
], validate, BlogReqController.delete, sendResponse);

export default blogreq;