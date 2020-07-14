import Blog from '../../models/Blog';
import {DatabaseError} from "../error/error";
import {DuplicatedBlogUrlExistsError} from "./error/error";
import '@babel/polyfill';

const saveBlog = async (blogInfo, session = null) => {
    const exists = await existsUrl(blogInfo.url, session);
    if (exists) {
        throw new DuplicatedBlogUrlExistsError();
    }

    let blog = new Blog();
    blog.url = blogInfo.url.replace(/[/]+$/, "");
    blog.feed.url = blogInfo.feed.url;
    blog.feed.tag = blogInfo.feed.tag;
    blog.created_at = new Date();
    blog.updated_at = new Date();

    return blog.save((session ? {session: session} : {}))
        .then(blog => {
            return {...blog.toObject(), _id: blog._id.toString()};
        })
        .catch(err => {
            throw new DatabaseError(err);
        });
};

const existsUrl = (url, session = null) => {
    const domainName = url.replace(/[/]+$/, "").replace(/^http(s)?:\/\//, "");
    const regex = new RegExp("^http(s)?://" + domainName + "$");
    return Blog.findOne({url: regex}, {_id: 1},
        (session ? {session: session} : {}))
        .then(savedBlog => {
            return !!savedBlog;
        })
        .catch(err => {
            throw new DatabaseError(err);
        });
};

const getBlogs = () => {
    return Blog.find().lean();
};

const getList = ({start, end, order, sort, url}) => {
    const [skip, limit] = [start, end - start];

    const pipeline = [];

    if (url) {
        pipeline.push({
            $match: {url: {$regex: `.*${url}.*`}}
        })
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

    return Blog.aggregate(pipeline)
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

const getOne = ({id}) => {
    return Blog.findOne({_id: id})
        .then(blog => {
            if (blog) {
                return {
                    exists: true,
                    blog: {...blog.toObject(), _id: blog._id.toString()}
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

const update = ({data}) => {
    return Blog.findOneAndUpdate({_id: data._id},
        {
            $set: {
                'feed.url': data.feed.url,
                'feed.tag': data.feed.tag,
                url: data.url.replace(/[/]+$/, ""),
                updated_at: new Date()
            }
        })
        .then(oldBlog => {
            if (oldBlog) {
                return getOne({id: data._id})
                    .then(result => {
                        if (result.exists) {
                            return {
                                exists: true,
                                id: data._id,
                                previousData: {...oldBlog.toObject(), _id: oldBlog._id.toString()},
                                data: result.blog
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

const deleteBlog = ({id}) => {
    return Blog.findOneAndDelete({_id: id})
        .then(deletedBlog => {
            if (deletedBlog) {
                return {...deletedBlog.toObject(), _id: deletedBlog._id.toString(), exists: true};
            }
            return {
                exists: false,
            }
        })
        .catch(err => {
            throw new DatabaseError(err);
        });
};

export default {
    saveBlog: saveBlog,
    existsUrl: existsUrl,
    getBlogs: getBlogs,
    getList: getList,
    getOne: getOne,
    update: update,
    delete: deleteBlog,
}
