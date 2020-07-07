import express from 'express';
import {body, param, query} from 'express-validator';
import PostController from "./PostController";
import {validate} from "../commons";
import moment from "moment";
import rangeParser from "parse-numeric-range";

const post = express.Router();

post.get('/', [
    query(['_start', '_end']).optional().isInt({min: 0}).withMessage('must be positive'),
    query('_start')
        .optional()
        .custom((value, {req}) => parseInt(value) < parseInt(req.query._end))
        .withMessage('must be less than end'),
    query('_sort').optional().not().isEmpty().withMessage('must not be empty string'),
    query('_order').optional().isIn(["ASC", "DESC"]).withMessage('must be "ASC" or "DESC"'),
    query('score')
        .optional()
        .custom((value, {req}) => {
            const parsed = rangeParser(value);
            return parsed.length > 0 && parsed.every(score => score > 0 && score <= 10)
        })
        .withMessage('must be between 1 and 10'),
    query('start_date').optional().isDate().withMessage('must be date'),
    query('end_date').optional().isDate().withMessage('must be date'),
    query('end_date')
        .optional()
        .custom((value, {req}) => moment(value).isSameOrAfter(moment(req.query.start_date))),
    query('unscored').optional().isBoolean().withMessage('must be boolean'),
], validate, PostController.getList);

post.get('/:id', [
    param('id').isMongoId().withMessage('must be mongoId'),
], validate, PostController.getOne);

post.put('/:id', [
    body('id').isMongoId().withMessage('must be mongoId'),
    body('score').isInt({min: 1, max: 10}).withMessage('must be between 1 and 10'),
], validate, PostController.update);

export default post;