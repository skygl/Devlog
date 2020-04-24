import BlogService from "../../services/blog/BlogService";
import DomService from "../../services/dom/DomService";
import PostService from "../../services/post/PostService";
import DomCrawler from "../../modules/DomCrawler";
import RssCrawler from "../../modules/RssCrawler";
import ScoringModel from "../../modules/ScoringModel";
import {copy} from "../../utils/Utils";

const crawlNewPosts = async () => {
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
                        console.error(error);
                    })
            });
        });
};

export default {
    crawlNewPosts: crawlNewPosts,
}
