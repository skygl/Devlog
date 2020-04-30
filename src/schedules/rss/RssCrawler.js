import BlogService from "../../services/blog/BlogService";
import DomService from "../../services/dom/DomService";
import PostService from "../../services/post/PostService";
import DomCrawler from "../../modules/DomCrawler";
import RssCrawler from "../../modules/RssCrawler";
import ScoringModel from "../../modules/ScoringModel";
import {copy} from "../../utils/Utils";
import logger from "../../utils/Logger";

const crawlNewPosts = async () => {
    logger.info("Crawling New Posts Starts.");
    BlogService.getBlogsCursor()
        .on('data', async function (doc) {
            let posts = await RssCrawler.crawlRss(doc);
            posts.forEach(post => {
                DomCrawler.crawlDom(post.url, doc.elements)
                    .then(async domInfo => {
                        let score = await ScoringModel.predictScore(domInfo);
                        let postInfo = copy(post);
                        postInfo.score = score;
                        await PostService.savePost(postInfo);
                        domInfo.url = post.url;
                        domInfo.expected_score = score;
                        await DomService.createDom(domInfo);
                    })
                    .catch(error => {
                        logger.error({
                            message: "Error Occurs During Crawling Post",
                            url: post.url,
                            error: error
                        });
                    })
            });
        })
        .on('end', function () {
            logger.info("Crawling New Posts Finished.");
        });
};

export default {
    crawlNewPosts: crawlNewPosts,
}
