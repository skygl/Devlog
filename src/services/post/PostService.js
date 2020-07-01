import Post from '../../models/Post';
import {getDate} from '../../utils/Utils';
import '@babel/polyfill';
import {DatabaseError, DuplicatedPostUrlExistsError} from "../error/error";

const savePost = async (postInfo) => {
    let existsUrl = await existsPostUrl(postInfo.url);

    if (existsUrl) {
        throw new DuplicatedPostUrlExistsError();
    }

    let post = new Post();
    post.url = postInfo.url;
    post.title = postInfo.title;
    post.description = postInfo.description;
    post.imageUrl = postInfo.imageUrl;
    post.tags = postInfo.tags;
    post.score = postInfo.score;
    post.published_at = postInfo.published_at;

    return post.save()
        .catch(error => {
            throw new DatabaseError(error);
        })
};

const existsPostUrl = async (url) => {
    return Post.findOne({url: url})
        .catch(error => {
            throw new DatabaseError(error);
        })
        .then(savedPost => !!savedPost);
};

const findByTag = async (tagInfo) => {
    return Post.find({tags: {$in: tagInfo.tag}})
        .sort({score: -1})
        .skip(5 * (tagInfo["page"] - 1))
        .limit(5)
        .catch(error => {
            throw new DatabaseError(error);
        })
};

const findTop5PostsPublishedYesterday = async () => {
    let gte_date = getDate(new Date(), {day: -1, hours: 0, min: 0, sec: 0, ms: 0});
    let lt_date = getDate(new Date(), {day: 0, hours: 0, min: 0, set: 0, ms: 0});
    return Post.find({published_at: {$gte: gte_date, $lt: lt_date}})
        .sort({score: -1})
        .limit(5)
        .catch(error => {
            throw new DatabaseError(error);
        })
};

export default {
    savePost: savePost,
    findByTag: findByTag,
    findTop5PostsPublishedYesterday: findTop5PostsPublishedYesterday,
}