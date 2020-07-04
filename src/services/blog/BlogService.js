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

export default {
    saveBlog: saveBlog,
    existsUrl: existsUrl,
    getBlogs: getBlogs,
    getList: getList,
}
