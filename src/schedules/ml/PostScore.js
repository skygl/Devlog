import scoringModel from '../../modules/ScoringModel';

async function trainNewModel() {
    await scoringModel.trainNewModel();
}

export default {
    trainNewModel: trainNewModel
}