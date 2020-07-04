import express from 'express';
import BlogReqController from './BlogReqController';

const blogreq = express.Router();

blogreq.post('/', BlogReqController.create);

export default blogreq;