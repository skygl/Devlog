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

export default {
    saveBlog: saveBlog,
    existsUrl: existsUrl,
    getBlogs: getBlogs,
}
