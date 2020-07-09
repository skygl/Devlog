import RssCrawler from "./rss/RssCrawler";

export default {
    RssCrawler: {
        frequency: "0 */3 * * *",
        job: RssCrawler.crawlNewPosts
    }
}
