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
                    PostService.savePost({
                        ...post,
                        title: replaceHTMLCode(post.title),
                        description: replaceHTMLCode(post.description).slice(0, 250),
                        blog: blog._id
                    })
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

const replaceHTMLCode = (string) => {
    return string.replace(/&(lt|gt|quot|nbsp|amp|apos);/g, function (m, t) {
        switch (t) {
            case 'lt':
                return '<';
            case 'gt':
                return '>';
            case 'quot':
                return '"';
            case 'nbsp':
                return '';
            case 'amp':
                return '&';
            case 'apos':
                return "'";
            default:
                return "";
        }
    }).replace(/(\n|&nbsp;|<([^>]+)>)/ig, "");
};

export default {
    crawlNewPosts: crawlNewPosts,
}
