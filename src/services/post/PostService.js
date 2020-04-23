import Post from '../../models/Post';
import '@babel/polyfill';
import {DatabaseError, DuplicatedPostUrlExistsError} from "../error/error";

const savePost = async (postInfo) => {
    let existsUrl = await existsPostUrl(postInfo.url);

    if (existsUrl) {
        throw new DuplicatedPostUrlExistsError();
    }

    let post = new Post();
    post.url = postInfo.url;
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

export default {
    savePost: savePost,
}