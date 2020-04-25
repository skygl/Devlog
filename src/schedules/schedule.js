import RssCrawler from "./rss/RssCrawler";
import PostScore from "./ml/PostScore";

export default {
    RssCrawler: {
        frequency: "5 12 * * *",
        job: RssCrawler.crawlNewPosts
    },
    TrainScoreModel: {
        frequency: "40 12 * * *",
        job: PostScore.trainNewModel
    }
}
