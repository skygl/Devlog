import Blog from '../../models/Blog';
import {DatabaseError} from "../error/error";
import {DuplicatedBlogUrlExistsError, NotExistsHandleableBlogError} from "./error/error";
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
    blog.created_at = Date.now();
    blog.updated_at = Date.now();
    blog.posts = [];

    return blog.save()
        .catch(err => {
            throw new DatabaseError(err);
        });
};

const findBlogForPostUrl = async (postUrl) => {
    const savedBlog = await Blog.findOne({$where: "this.post_regex && RegExp(this.post_regex).test(\"" + postUrl + "\")"})
        .catch(err => {
            throw new DatabaseError(err);
        });
    if (!savedBlog) {
        throw new NotExistsHandleableBlogError();
    }
    return savedBlog;
};

const existsUrl = (url) => {
    return Blog.findOne({url: url})
        .catch(err => {
            throw new DatabaseError(err);
        })
        .then(savedBlog => !!savedBlog);
};

const getBlogsCursor = () => {
    return Blog.find().lean().cursor();
};

export default {
    saveBlog: saveBlog,
    existsUrl: existsUrl,
    findBlogForPostUrl: findBlogForPostUrl,
    getBlogsCursor: getBlogsCursor,
}
