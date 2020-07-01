import BlogService from "../../services/blog/BlogService";
import DomService from "../../services/dom/DomService";
import PostService from "../../services/post/PostService";
import DomCrawler from "../../modules/DomCrawler";
import RssCrawler from "../../modules/RssCrawler";
import ScoringModel from "../../modules/ScoringModel";
import {copy} from "../../utils/Utils";
import logger from "../../utils/Logger";

const crawlNewPosts = async () => {
    logger.info("[CR] Begin crawling new posts");
    let blogs = await BlogService.getBlogs();

    for (const blog of blogs) {
        let posts = await RssCrawler.crawlNewPosts(blog);
        for (const post of posts) {
            await DomCrawler.crawlDom(post.url, blog.elements)
                .then(async (domInfo) => {
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
                        message: "[CR] Error occurs during crawling elements in post",
                        url: post.url,
                        error: error.message,
                        stacktrace: error.stack
                    });
                });
        }
    }

    logger.info("[CR] End crawling new posts");
};

export default {
    crawlNewPosts: crawlNewPosts,
}
