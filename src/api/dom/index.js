import express from 'express';
import DomController from './DomController';

const dom = express.Router();

dom.post('/score', DomController.scoreDom);
dom.post('/test', DomController.testDom);

export default dom;