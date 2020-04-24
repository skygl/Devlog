import BlogService from "../../services/blog/BlogService";
import RssCrawler from "../../modules/RssCrawler";

const crawlNewPosts = async () => {
    BlogService.getBlogsCursor()
        .on('data', async function (doc) {
            await RssCrawler.crawlRss(doc);
        });
};

export default {
    crawlNewPosts: crawlNewPosts,
}
