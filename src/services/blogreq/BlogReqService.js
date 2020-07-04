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
    let url = blogInfo.url;

    let existsBlogUrl = await BlogService.existsUrl(url);
    if (existsBlogUrl) {
        throw new ExistsUrlError("There is a Existed Blog Having Request Url.", url);
    }

    let existsBlogReqUrl = await existsUrl(url);
    if (existsBlogReqUrl) {
        throw new ExistsUrlError("There is a Existed BlogRequest Having Request Url.", url)
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
    return BlogReq.findOne({url: url, status: {$ne: DENIED}})
        .catch(error => {
            throw new DatabaseError(error);
        })
        .then(savedBlogReq => !!savedBlogReq);
};

const getList = async ({_start, _end, _order, _sort}) => {
    const [skip, limit] = [_start, _end - _start];

    const pipeline = [];
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
                url: data.url,
                status: data.status,
                reason: data.reason,
                updated_at: updatedTime,
            }
        })
        .then(oldBlogReq => {
            const newBlogReq = {
                _id: data._id,
                url: data.url,
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
                url: data.url,
                post_regex: data.post_regex,
                feed: {
                    tag: data.feed.tag,
                    url: data.feed.url,
                },
                elements: {
                    from: data.elements.from,
                    remove: data.elements.remove,
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
}