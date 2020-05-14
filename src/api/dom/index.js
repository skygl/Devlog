import express from 'express';
import DomController from './DomController';

const dom = express.Router();

dom.get('/unscored', DomController.loadUnscoredDom);
dom.post('/unscored/score', DomController.scoreUnscoredDom);
dom.post('/score', DomController.scoreDom);
dom.post('/test', DomController.testDom);

export default dom;