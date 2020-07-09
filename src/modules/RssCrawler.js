import cheerio from 'cheerio';
import axios from "axios";
import moment from "moment";

const crawlNewPosts = async (blog, createLog, startTime, endTime) => {
    let promises = [];

    const feedHtml = await axios.get(blog.feed.url);

    let $ = cheerio.load(feedHtml.data, {xmlMode: true});

    $("item").each(function () {
        const published_at = new Date($(this).find("pubDate").text());
        const moment_pubDate = moment(published_at);

        if (moment_pubDate.isBefore(startTime)) {
            return false;
        } else if (moment_pubDate.isSameOrAfter(endTime)) {
            return true;
        }

        promises.push(new Promise((resolve) => {
            const url = $(this).find("link").text();
            crawlDescs(url, blog.feed.tag)
                .then(descs => {
                    resolve({
                        url: url,
                        published_at: published_at,
                        tags: descs.tags,
                        title: descs.title,
                        description: descs.description,
                        imageUrl: descs.imageUrl
                    });
                })
                .catch(error => {
                    createLog({
                        message: "Error occurs during crawling posts in rss",
                        url: blog.url,
                        error: error
                    });
                    resolve();
                })
        }));
    });

    return Promise.all(promises)
        .then(posts => posts.filter(post => !!post))
        .catch(error => {
            createLog({
                message: "Error occurs during crawling posts in rss",
                url: blog.url,
                error: error
            });
        })
};

const parseImage = ($) => {
    let element;
    if ((element = $("meta[property='og:image']")).length > 0) {
        return element.attr("content");
    }
    return "/devlog.png";
};

const parseTitle = ($) => {
    let element;
    if ((element = $("meta[property='og:title']")).length > 0
        || (element = $("meta[name='title']")).length > 0) {
        return element.attr("content");
    } else if ((element = $("head > title")).length > 0) {
        return element.text();
    } else {
        return "";
    }
};

const parseDescription = ($) => {
    let element;
    if ((element = $("meta[property='og:description']")).length > 0
        || (element = $("meta[name='description']")).length > 0) {
        return element.attr("content");
    } else if ((element = $("head > description")).length > 0) {
        return element.text();
    } else {
        return "";
    }
};

const crawlDescs = async (url, tagSelector) => {
    let tags = [];

    const html = await axios.get(url);

    let $ = cheerio.load(html.data);

    const title = parseTitle($);
    const imageUrl = parseImage($);
    const description = parseDescription($);

    $(tagSelector).each((i, elem) => {
        tags[i] = $(elem).text().trim();
    });

    return {
        tags,
        title,
        imageUrl,
        description
    };
};

class RssCrawler {
    constructor() {
    }

    async crawlNewPosts(blog, createLog, startTime, endTime) {
        return crawlNewPosts(blog, createLog, startTime, endTime);
    }
}

let rssCrawler = new RssCrawler();

module.exports = rssCrawler;