import express from 'express';
import DomController from './DomController';

const dom = express.Router();

dom.post('/score', DomController.scoreDom);

export default dom;