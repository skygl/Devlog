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

const crawlRss = (blog) => {
    return new Promise((resolve, reject) =>
        axios.get(blog.feed.url)
            .then(html => {
                let promises = [];

                let $ = cheerio.load(html.data, {xmlMode: true});

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
                            })
                            .catch(err => {
                                reject(err);
                            });
                    }));
                });

                Promise.all(promises)
                    .then(post => {
                        resolve(post);
                    })
                    .catch(err => {
                        console.error(err);
                        reject(err);
                    })
            }));
};

const crawlTags = async (url, tagDom) => {
    return axios.get(url)
        .then(html => {
            let tags = [];
            let $ = cheerio.load(html.data);
            $(tagDom).each((i, elem) => {
                tags[i] = $(elem).text().trim();
            });
            return tags;
        });
};

export default {
    crawlNewPosts: crawlNewPosts,
}
