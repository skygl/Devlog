import * as tf from '@tensorflow/tfjs';
import DomService from "../services/dom/DomService";
import fs from 'fs';
import path from 'path';
import 'tfjs-node-save';
import {getDate} from '../utils/Utils';
import logger from '../utils/Logger';

const SCORE_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SCORE_COUNT = SCORE_CLASSES.length;
const TAGS = ['h1', 'h2', 'h3', 'p', 'code', 'img', 'ul', 'ol', 'li', 'a', 'blockquote', 'table'];
const FILE_DIR_PATH = 'file://' + __dirname + '/';

class Model {
    constructor() {
        this.className = null;
        this.model = null;
        this.isTraining = false;
        this.isModelOne = false;
    }

    async trainNewModel(dataByScore, targetsByScore, callback) {
        function determineFileDir(className, isModelOne) {
            const modelNumber = isModelOne ? '1' : '2';
            const dirs = [className, modelNumber];
            const modelPath = path.resolve(__dirname, ...dirs, 'model.json');
            const weightsPath = path.resolve(__dirname, ...dirs, 'weights.bin');

            for (let i = 1; i <= dirs.length; i++) {
                const dirPath = path.resolve(__dirname, ...dirs.slice(0, i));
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }
            }

            if (fs.existsSync(modelPath)) {
                fs.unlinkSync(modelPath);
            }
            if (fs.existsSync(weightsPath)) {
                fs.unlinkSync(weightsPath);
            }

            return FILE_DIR_PATH + className + (isModelOne ? '/1' : '/2');
        }

        function createData(dataByScore, targetsByScore, testSplit) {
            const xTrains = [];
            const yTrains = [];
            const xTests = [];
            const yTests = [];

            function convertToTensors(data, target, testSplit) {
                const numExamples = data.length;
                if (numExamples !== target.length) {
                    throw new Error("data and split have different numbers of example.");
                }

                const numTestExamples = Math.round(numExamples * testSplit);
                const numTrainExamples = numExamples - numTestExamples;

                const xDims = data[0].length;

                const xs = tf.tensor2d(data, [numExamples, xDims]);
                const ys = tf.oneHot(tf.tensor1d(target).toInt(), SCORE_COUNT);

                const xTrain = xs.slice([0, 0], [numTrainExamples, xDims]);
                const xTest = xs.slice([numTrainExamples, 0], [numTestExamples, xDims]);
                const yTrain = ys.slice([0, 0], [numTrainExamples, SCORE_COUNT]);
                const yTest = ys.slice([numTrainExamples, 0], [numTestExamples, SCORE_COUNT]);

                return [xTrain, yTrain, xTest, yTest];
            }

            for (let i = 0; i < SCORE_COUNT; i++) {
                const [xTrain, yTrain, xTest, yTest] = convertToTensors(dataByScore[i], targetsByScore[i], testSplit);
                xTrains.push(xTrain);
                yTrains.push(yTrain);
                xTests.push(xTest);
                yTests.push(yTest);
            }

            const concatAxis = 0;

            return [
                tf.concat(xTrains, concatAxis), tf.concat(yTrains, concatAxis),
                tf.concat(xTests, concatAxis), tf.concat(yTests, concatAxis)
            ];
        }

        async function trainModel(xTrain, yTrain, xTest, yTest) {
            const model = tf.sequential();
            const learningRate = .01;
            const numberOfEpochs = 200;
            const optimizer = tf.train.adam(learningRate);

            model.add(tf.layers.dense(
                {units: 100, activation: "relu", inputShape: [xTrain.shape[1]]}
            ));
            model.add(tf.layers.dense(
                {units: 100, activation: 'relu'}
            ));
            model.add(tf.layers.dense(
                {units: SCORE_COUNT, activation: 'softmax'}
            ));

            model.compile(
                {optimizer: optimizer, loss: 'categoricalCrossentropy', metrics: ['accuracy']}
            );

            await model.fit(xTrain, yTrain, {
                epochs: numberOfEpochs,
                validationData: [xTest, yTest],
                callbacks: {
                    onTrainBegin: () => {
                        logger.info("Training Begins");
                    },
                    onTrainEnd: () => {
                        logger.info("Training Ends");
                    }
                }
            });

            return model;
        }

        if (this.isTraining) {
            throw new Error(`[ML] The model is training now - name : ${this.className}`);
        }
        this.isTraining = true;
        this.isModelOne = !this.isModelOne;
        const fileDirPath = determineFileDir(this.className, this.isModelOne);
        logger.info(`[ML] Begin training new model - name : ${this.className}, fileDirPath : ${fileDirPath}`);

        const [xTrain, yTrain, xTest, yTest] = tf.tidy(() => createData(dataByScore, targetsByScore, .2));

        const tempModel = await trainModel(xTrain, yTrain, xTest, yTest);
        this.model = tempModel;
        return tempModel.save(fileDirPath)
            .then(() => {
                logger.info(`[ML] End training new model - name : ${this.className}, fileDirPath : ${fileDirPath}`);
                return callback;
            }, (error) => {
                throw new Error(`[ML] Error occurs during saving model - name : ${this.className}, fileDirPath : ${fileDirPath}, details - ${JSON.stringify(error)}`);
            });
    }

    async predictScore(data) {
        if (!this.model) {
            throw new Error("[ML] The scoring model has not learned yet");
        }

        const inputData = tf.tensor2d(data, [1, data.length]);
        const prediction = await this.model.predict(inputData);

        return prediction.argMax(-1).dataSync()[0] + 1;
    }
}

class ElementBaseModel extends Model {
    constructor() {
        super();
        this.className = "ElementBaseModel";
    }

    async trainNewModel(doms, callback) {
        const dataByScore = [];
        const targetsByScore = [];

        for (let i = 0; i < SCORE_COUNT; i++) {
            dataByScore.push([]);
            targetsByScore.push([]);
        }

        doms.forEach(dom => {
            const target = dom.score;
            const data = [];
            for (const tag of TAGS) {
                data.push(!dom[tag] ? 0 : dom[tag]);
            }
            dataByScore[target - 1].push(data);
            targetsByScore[target - 1].push(target);
        });

        return super.trainNewModel(dataByScore, targetsByScore, callback);
    }

    async predictScore(targetDomInfo) {
        const elements = [];

        for (const tag of TAGS) {
            elements.push(targetDomInfo[tag] ? targetDomInfo[tag] : 0);
        }

        return super.predictScore(elements);
    }
}

class ScoringModel {
    constructor() {
        this.models = [new ElementBaseModel()];
    }

    async predictScore(domInfo) {
        return this.models[0].predictScore(domInfo)
    }

    async trainNewModel() {
        let doms = await DomService.findDom({scored: true, endDate: getDate(new Date(), {day: -1})});
        return this.models[0].trainNewModel(doms);
    }
}

const scoringModel = new ScoringModel();

module.exports = scoringModel;