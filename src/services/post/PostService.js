import Post from '../../models/Post';
import {getDate} from '../../utils/Utils';
import '@babel/polyfill';
import rangeParser from "parse-numeric-range";
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
    post.created_at = new Date();

    return post.save()
        .then(post => {
            const obj = post.toObject();
            return {...obj, _id: obj._id.toString()};
        })
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

const getList = async ({start, end, order, sort, url, score, start_date, end_date, unscored}) => {
    const [skip, limit] = [start, end - start];

    const pipeline = [];
    if (url || score || start_date || end_date || unscored) {
        const match = {$match: {}};
        if (url) {
            match.$match.url = {$regex: `.*${url}.*`};
        }
        if (score) {
            match.$match.score = {$in: rangeParser(score)};
        }
        if (start_date || end_date) {
            match.$match.published_at = {};
            if (start_date) {
                match.$match.published_at.$gte = new Date(new Date(start_date).setHours(0, 0, 0, 0));
            }
            if (end_date) {
                match.$match.published_at.$lte = new Date(new Date(end_date).setHours(23, 59, 59, 999));
            }
        }
        if (unscored === 'true') {
            match.$match.score = null;
        } else if (unscored === 'false') {
            match.$match.score = {$ne: null}
        }
        pipeline.push(match);
    }

    pipeline.push({
        $facet: {
            data: [
                {"$sort": {[sort === 'id' ? '_id' : sort]: order === 'ASC' ? 1 : -1}},
                {"$skip": skip},
                {"$limit": limit}
            ],
            count: [
                {$count: "count"}
            ]
        }
    });

    return Post.aggregate(pipeline)
        .then(result => {
            return {
                data: result[0].data,
                count: result[0].count[0].count
            }
        })
        .catch(err => {
            if (err.message === `Cannot read property 'count' of undefined`) {
                return {
                    data: [],
                    count: 0
                }
            }
            throw new DatabaseError(err);
        })
};

const getOne = async ({id}) => {
    return Post.findOne({_id: id})
        .then(post => {
            if (post) {
                return {
                    exists: true,
                    post: {...post.toObject(), _id: post._id.toString()}
                }
            } else {
                return {
                    exists: false,
                }
            }
        })
        .catch(err => {
            throw new DatabaseError(err);
        })
};

const update = async ({id, score}) => {
    return Post.findOneAndUpdate({_id: id},
        {
            $set: {
                score: score
            }
        })
        .then(async (oldPost) => {
            if (oldPost) {
                return getOne({id: id})
                    .then(result => {
                        if (result.exists) {
                            return {
                                exists: true,
                                id: id,
                                previousData: {...oldPost.toObject(), _id: oldPost._id.toString()},
                                data: result.post
                            }
                        }
                        return {
                            exists: false,
                        }
                    })
            } else {
                return {
                    exists: false,
                }
            }
        })
        .catch(err => {
            throw new DatabaseError(err);
        })
};

const deletePost = async ({id}) => {
    return Post.findOneAndDelete({_id: id})
        .then(deletedPost => {
            if (deletedPost) {
                return {...deletedPost.toObject(), _id: deletedPost._id.toString(), exists: true};
            }
            return {
                exists: false,
            }
        })
        .catch(err => {
            throw new DatabaseError(err);
        })
};

export default {
    savePost: savePost,
    findTop5PostsPublishedYesterday: findTop5PostsPublishedYesterday,
    getList: getList,
    getOne: getOne,
    update: update,
    delete: deletePost,
}