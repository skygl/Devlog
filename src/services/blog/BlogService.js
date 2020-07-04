import Blog from '../../models/Blog';
import {DatabaseError} from "../error/error";
import {DuplicatedBlogUrlExistsError} from "./error/error";
import '@babel/polyfill';

const saveBlog = async (blogInfo) => {
    const exists = await existsUrl(blogInfo.url);
    if (exists) {
        throw new DuplicatedBlogUrlExistsError();
    }

    let blog = new Blog();
    Object.keys(blogInfo).forEach(key => {
        blog[key] = blogInfo[key];
    });
    blog.created_at = new Date();
    blog.updated_at = new Date();

    return blog.save()
        .then(blog => blog.toObject())
        .catch(err => {
            throw new DatabaseError(err);
        });
};

const existsUrl = (url) => {
    return Blog.findOne({url: url})
        .catch(err => {
            throw new DatabaseError(err);
        })
        .then(savedBlog => !!savedBlog);
};

const getBlogs = () => {
    return Blog.find().lean();
};

const getList = ({_start, _end, _order, _sort}) => {
    const [skip, limit] = [_start, _end - _start];

    return Blog.aggregate([
        {
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
        }
    ])
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

const getOne = ({id}) => {
    return Blog.findOne({_id: id})
        .then(blog => blog.toObject())
        .catch(err => {
            throw new DatabaseError(err);
        })
};

const update = ({data}) => {
    return Blog.findOneAndUpdate({_id: data._id},
        {
            $set: {
                'elements.from': data.elements.from,
                'elements.remove': data.elements.remove,
                'feed.url': data.feed.url,
                'feed.tag': data.feed.tag,
                url: data.url,
                post_regex: data.post_regex,
                updated_at: new Date()
            }
        }, {new: true})
        .then(updatedBlog => {
            const oldBlog = {...data};
            delete oldBlog.id;
            return {
                id: data._id,
                previousData: oldBlog,
                data: updatedBlog
            }
        })
        .catch(err => {
            throw new DatabaseError(err);
        })
};

const deleteBlog = ({id}) => {
    return Blog.findOneAndDelete({_id: id})
        .then(deletedBlog => deletedBlog.toObject())
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
