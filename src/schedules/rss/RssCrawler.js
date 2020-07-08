import BlogService from "../../services/blog/BlogService";
import PostService from "../../services/post/PostService";
import RssCrawler from "../../modules/RssCrawler";
import logger from "../../utils/Logger";
import moment from "moment";

const crawlNewPosts = async () => {
    logger.info(JSON.stringify({
        type: "CR",
        message: "Begin crawling new posts",
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
    }));
    let blogs = await BlogService.getBlogs();

    for (const blog of blogs) {
        let posts = await RssCrawler.crawlNewPosts(blog);
        for (const post of posts) {
            PostService.savePost(post)
                .catch(error => {
                    logger.error(JSON.stringify({
                        type: "CR",
                        message: "Error occurs during saving posts",
                        time: moment().format('YYYY-MM-DD HH:mm:ss'),
                        url: post.url,
                        error: error.message,
                        stack: error.stack
                    }));
                });
        }
    }

    logger.info(JSON.stringify({
        type: "CR",
        message: "End crawling new posts",
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
    }));
};

export default {
    crawlNewPosts: crawlNewPosts,
}
