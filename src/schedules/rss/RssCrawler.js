import BlogService from "../../services/blog/BlogService";
import PostService from "../../services/post/PostService";
import RssCrawler from "../../modules/RssCrawler";
import logger from "../../utils/Logger";

const crawlNewPosts = async () => {
    logger.info("[CR] Begin crawling new posts");
    let blogs = await BlogService.getBlogs();

    for (const blog of blogs) {
        let posts = await RssCrawler.crawlNewPosts(blog);
        for (const post of posts) {
            PostService.savePost(post)
                .catch(error => {
                    logger.error(JSON.stringify({
                        message: "[CR] Error occurs during crawling elements in post",
                        url: post.url,
                        error: error.message,
                        stacktrace: error.stack
                    }));
                });
        }
    }

    logger.info("[CR] End crawling new posts");
};

export default {
    crawlNewPosts: crawlNewPosts,
}
