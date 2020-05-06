import SlackClient from '../config/slackclient';
import getShortenedURL from '../config/naver';
import cheerio from 'cheerio';
import axios from 'axios';
import logger from '../utils/Logger';

const postRecommendsToSlackChannel = async (posts) => {
    return Promise.all(posts.map(post => getPostInfoWithAsync(post)))
        .then(postInfos => {
            const blocks = [{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "오늘의 새로운 블로그 글입니다."
                }
            }];
            postInfos.reduce((blocks, postInfo) => {
                const block = {
                    type: "section",
                    text: {
                        "type": "mrkdwn"
                    }
                };
                block.text.text = (postInfo.title ? `>*${postInfo.title}*\n>\n` : '') +
                    (postInfo.description ? `>${postInfo.description}\n>\n` : '') +
                    ((postInfo.tags && postInfo.tags.length > 0) ? `>${postInfo.tags.map(tag => '`#' + tag + '`').join(' ')}\n>\n` : '') +
                    `>${postInfo.url}`;
                if (postInfo.image) {
                    block.accessory = {
                        "type": "image",
                        "image_url": postInfo.image,
                        "alt_text": `블로그 ${postInfo.title ? postInfo.title : ''} 글의 이미지`
                    }
                }
                blocks.push(block);
                return blocks;
            }, blocks);
            return blocks;
        })
        .then(blocks => {
            return SlackClient.postRecommendsToSlackChannel(blocks);
        })
        .catch(error => {
            logger.error({
                Message: "Error Occurred While Posting Recommends To Slack Channel",
                Details: error.message,
            })
        });
};

const getPostInfoWithPromise = (post) => {
    return new Promise((resolve) => {
        return axios.get(post.url)
            .then(async res => {
                const $ = cheerio.load(res.data);

                resolve({
                    url: await getShortenedURL(post.url),
                    title: $("meta[property='og:title']").attr("content"),
                    description: $("meta[property='og:description']").attr("content"),
                    tags: post.tags,
                    image: $("meta[property='og:image']").attr("content")
                });
            });
    });
};

const getPostInfoWithAsync = async (post) => {
    return getPostInfoWithPromise(post);
};

module.exports = postRecommendsToSlackChannel;