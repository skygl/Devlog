import cheerio from 'cheerio';
import axios from "axios";
import {getDate} from "../utils/Utils";

const crawlRss = async (blog) => {
    let promises = [];

    const feedHtml = await axios.get(blog.feed.url);

    let $ = cheerio.load(feedHtml.data, {xmlMode: true});

    $("item").each(function () {
        const published_at = new Date($(this).find("pubDate").text());
        const yesterday = getDate(new Date(), {day: -1, hours: 0, min: 0, sec: 0, ms: 0});

        if (yesterday > published_at || (published_at - yesterday) > 24 * 60 * 60 * 1000) {
            return false;
        }

        promises.push(new Promise((resolve) => {
            const url = $(this).find("link").text();
            crawlTags(url, blog.feed.tag)
                .then(tags => {
                    resolve({
                        url: url,
                        published_at: published_at,
                        tags: tags,
                    });
                });
        }));
    });

    return Promise.all(promises)
        .catch(err => {
            console.error(err);
            throw err;
        })
};

const crawlTags = async (url, tagDom) => {
    let tags = [];

    const html = await axios.get(url);

    let $ = cheerio.load(html.data);
    $(tagDom).each((i, elem) => {
        tags[i] = $(elem).text().trim();
    });

    return tags;
};

class RssCrawler {
    constructor() {
    }

    async crawlRss(doc) {
        return crawlRss(doc);
    }
}

let rssCrawler = new RssCrawler();

module.exports = rssCrawler;