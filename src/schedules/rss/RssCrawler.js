import cheerio from 'cheerio';
import axios from "axios";
import BlogService from "../../services/blog/BlogService";

function getYesterdayMidnight() {
    let today = new Date();
    let yesterday = new Date(today);

    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    return yesterday;
}

const crawlNewPosts = async () => {
    BlogService.getBlogsCursor()
        .on('data', function (doc) {
            crawlRss(doc);
        });
};

const crawlRss = async (blog) => {
    let promises = [];

    const feedHtml = await axios.get(blog.feed.url);

    let $ = cheerio.load(feedHtml.data, {xmlMode: true});

    $("item").each(function () {
        const created_at = new Date($(this).find("pubDate").text());
        const yesterday = getYesterdayMidnight();

        if (yesterday > created_at || (created_at - yesterday) > 24 * 60 * 60 * 1000) {
            return false;
        }

        promises.push(new Promise((resolve) => {
            const url = $(this).find("link").text();
            crawlTags(url, blog.feed.tag)
                .then(tags => {
                    resolve({
                        url: url,
                        created_at: created_at,
                        tags: tags,
                    });
                });
        }));

        Promise.all(promises)
            .then(post => {
                console.log(post);
            })
            .catch(err => {
                console.error(err);
                throw err;
            })
    });
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

export default {
    crawlNewPosts: crawlNewPosts,
}
