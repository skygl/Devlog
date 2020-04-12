import express from 'express';
import DomController from './DomController';

const dom = express.Router();

dom.post('/', DomController.createDom);

export default dom;