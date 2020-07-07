import BlogReq from '../../models/BlogReq';
import BlogService from '../blog/BlogService';
import {ExistsUrlError} from './error/error';
import '@babel/polyfill';
import {DatabaseError} from "../error/error";

const UNHANDLED = "Unhandled";
const DENIED = "Denied";
const SUSPENDED = "Suspended";
const REGISTERED = "Registered";

const createBlogReq = async (blogInfo) => {
    let url = blogInfo.url.replace(/[/]+$/, "");

    const exists = await existsUrl(url);
    if (exists.exists) {
        throw new ExistsUrlError(exists.message, url, exists.type)
    }

    let blogReq = new BlogReq();
    blogReq.url = url;
    blogReq.status = UNHANDLED;
    blogReq.created_at = new Date();
    blogReq.updated_at = new Date();

    return blogReq.save()
        .then(blogReq => blogReq.toObject())
        .catch(err => {
            throw new DatabaseError(err);
        })
};

const existsUrl = async (url) => {
    let existsBlogUrl = await BlogService.existsUrl(url.replace(/[/]+$/, ""));
    if (existsBlogUrl) {
        return {
            exists: true,
            message: "There is a Existed Blog Having Request Url.",
            type: 'blog'
        };
    }

    let existsBlogReqUrl = await BlogReq.findOne({url: url.replace(/[/]+$/, ""), status: {$ne: DENIED}})
        .catch(error => {
            throw new DatabaseError(error);
        })
        .then(savedBlogReq => !!savedBlogReq);
    if (existsBlogReqUrl) {
        return {
            exists: true,
            message: "There is a Existed BlogRequest Having Request Url.",
            type: 'blogreq'
        };
    }
    return {
        exists: false
    }
};

const getList = async ({_start, _end, _order, _sort, url, status}) => {
    const [skip, limit] = [_start, _end - _start];

    const pipeline = [];

    if (url || status) {
        const match = {$match: {}};
        if (url) {
            match.$match.url = {$regex: `.*${url}.*`};
        }
        if (status) {
            match.$match.status = status;
        }
        pipeline.push(match);
    }
    pipeline.push({
        $facet: {
            data: [
                {"$sort": {[_sort === 'id' ? '_id' : _sort]: _order === 'ASC' ? 1 : -1}},
                {"$skip": skip},
                {"$limit": limit}
            ],
            count: [
                {$count: "count"}
            ]
        }
    });

    return BlogReq.aggregate(pipeline)
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
    return BlogReq.findOne({_id: id})
        .then(blogReq => blogReq.toObject())
        .catch(err => {
            throw new DatabaseError(err);
        })
};

const update = async ({data}) => {
    const updatedTime = new Date();
    return BlogReq.findOneAndUpdate({_id: data._id},
        {
            $set: {
                url: data.url.replace(/[/]+$/, ""),
                status: data.status,
                reason: data.reason,
                updated_at: updatedTime,
            }
        })
        .then(oldBlogReq => {
            const newBlogReq = {
                _id: data._id,
                url: data.url.replace(/[/]+$/, ""),
                status: data.status,
                reason: data.reason,
                created_at: oldBlogReq.created_at,
                updated_at: updatedTime
            };
            return {
                id: data._id,
                previousData: oldBlogReq,
                data: newBlogReq
            }
        })
        .catch(err => {
            throw new DatabaseError(err);
        })
        .then(res => {
            if (res.data.status !== REGISTERED) {
                return res;
            }
            const blogInfo = {
                url: data.url.replace(/[/]+$/, ""),
                feed: {
                    tag: data.feed.tag,
                    url: data.feed.url,
                },
            };
            return BlogService.saveBlog(blogInfo)
                .then(() => res);
        })
};

const deleteBlogReq = ({id}) => {
    return BlogReq.findOneAndDelete({_id: id})
        .then(deletedBlogReq => deletedBlogReq.toObject())
        .catch(err => {
            throw new DatabaseError(err);
        })
};

export default {
    createBlogReq: createBlogReq,
    getList: getList,
    getOne: getOne,
    update: update,
    delete: deleteBlogReq,
    existsUrl: existsUrl
}