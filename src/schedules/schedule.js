import RssCrawler from "./rss/RssCrawler";

export default {
    RssCrawler: {
        frequency: "0 1 * * *",
        job: RssCrawler.crawlNewPosts
    }
}
