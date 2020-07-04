import express from 'express';
import BlogReqController from './BlogReqController';

const blogreq = express.Router();

blogreq.post('/', BlogReqController.create);
blogreq.get('/', BlogReqController.getList);
blogreq.get('/:id', BlogReqController.getOne);

export default blogreq;