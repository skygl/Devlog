import RssCrawler from "./rss/RssCrawler";
import PostScore from "./ml/PostScore";

export default {
    RssCrawler: {
        frequency: "0 0 1 * *",
        job: RssCrawler.crawlNewPosts
    },
    TrainScoreModel: {
        frequency: "0 0 2 * *",
        job: PostScore.trainNewModel
    }
}
