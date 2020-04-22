import * as tf from '@tensorflow/tfjs';
import DomService from "../../services/dom/DomService";
import fs from 'fs';
import path from 'path';
import 'tfjs-node-save';
import getDate from '../../utils/Utils';

const SCORE_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const SCORE_COUNT = SCORE_CLASSES.length;
const TAGS = ['h1', 'h2', 'h3', 'p', 'code', 'img', 'ul', 'ol', 'li', 'a', 'blockquote', 'table'];

let model;
let tempModel;

let isFirstModel = false;

async function trainModel(xTrain, yTrain, xTest, yTest) {
    const model = tf.sequential();
    const learningRate = .01;
    const numberOfEpochs = 100;
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
                console.log("Training Begins");
            },
            onTrainEnd: () => {
                console.log("Training Ends");
            }
        }
    });

    return model;
}

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

const getDomData = (testSplit, doms) => {
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

    const xTrains = [];
    const yTrains = [];
    const xTests = [];
    const yTests = [];

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
};

async function saveModel(model) {
    return model.save('file://' + __dirname + '/model' + (isFirstModel ? '2' : '1'));
}

async function loadOrTrainModel() {
    if (!model && fs.existsSync(path.resolve(__dirname, 'model1/model.json'))) {
        console.log("Load Model 1");
        tempModel = await tf.loadLayersModel('file://' + __dirname + '/model1/model.json');
    } else {
        console.log("Train New Model " + (isFirstModel ? "2" : "1"));
        let doms = await DomService.findDom({scored: true, endDate: getDate(new Date(), {day: -1})});
        const [xTrain, yTrain, xTest, yTest] = tf.tidy(() => getDomData(.2, doms));

        tempModel = await trainModel(xTrain, yTrain, xTest, yTest);
        console.log("New Model " + (isFirstModel ? "2" : "1") + " Training Finished");

        await saveModel(tempModel);
    }
    return tempModel;
}

async function predictScore(testDomInfo) {
    if (!model) {
        await loadOrTrainModel();
    }
    const data = [];

    for (const tag of TAGS) {
        data.push(testDomInfo[tag] ? testDomInfo[tag] : 0);
    }

    const inputData = tf.tensor2d(data, [1, data.length]);
    const prediction = await model.predict(inputData);

    console.log("prediction", prediction.argMax(-1).dataSync());
}

async function trainNewModel() {
    loadOrTrainModel()
        .then(tempModel => {
            model = tempModel;
            isFirstModel = !isFirstModel;
        });
}

export default {
    trainNewModel: trainNewModel,
    predictScore: predictScore
}