import express from 'express';
import BlogReqController from './BlogReqController';

const blogreq = express.Router();

blogreq.post('/', BlogReqController.create);
blogreq.get('/', BlogReqController.getList);
blogreq.get('/:id', BlogReqController.getOne);
blogreq.put('/:id', BlogReqController.update);

export default blogreq;