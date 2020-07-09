import BlogService from "../../services/blog/BlogService";
import PostService from "../../services/post/PostService";
import RssCrawler from "../../modules/RssCrawler";
import logger from "../../utils/Logger";
import moment from "moment";

const crawlNewPosts = async () => {
    createLog({message: "Begin crawling new posts"});
    const endTime = moment().startOf('hour');
    const startTime = moment(endTime).subtract(3, 'h');
    BlogService.getBlogs()
        .then(async (blogs) => {
            for (const blog of blogs) {
                const posts = await RssCrawler.crawlNewPosts(blog, createLog, startTime, endTime)
                    .catch(error => {
                        createLog({message: "Error occurs during crawling new posts", url: blog.url, error: error});
                        return [];
                    });
                for (const post of posts) {
                    PostService.savePost(post)
                        .catch(error => {
                            createLog({
                                message: "Error occurs during saving post",
                                url: post.url,
                                error: error
                            });
                        });
                }
            }
            createLog({message: "End crawling new posts"});
        })
        .catch(error => {
            createLog({message: "Error occurs during getting blogs", error: error});
        });
};

const createLog = ({message, error, url}) => {
    const info = {
        type: "CR",
        message: message,
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    if (!!url) {
        info.url = url;
    }
    if (!!error) {
        info.error = error.message;
        logger.error(JSON.stringify(info));
        return;
    }
    logger.info(JSON.stringify(info));
};

export default {
    crawlNewPosts: crawlNewPosts,
}
