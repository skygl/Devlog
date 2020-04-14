import Blog from '../../models/Blog';
import {DatabaseError} from "../error/error";
import {DuplicatedBlogUrlExistsError} from "./error/error";

const saveBlog = (blogInfo) => {
    return new Promise((resolve, reject) =>
        existsUrl(blogInfo.url)
            .then(result => {
                if (result) {
                    reject(new DuplicatedBlogUrlExistsError());
                } else {
                    let blog = new Blog();
                    blog.url = blogInfo.url;
                    blog.feed = blogInfo.feed;
                    blog.post_regex = blogInfo.post_regex;
                    blog.elements = blogInfo.elements;
                    blog.created_at = Date.now();
                    blog.updated_at = Date.now();
                    blog.posts = [];

                    blog.save()
                        .then(savedBlog => {
                            resolve(savedBlog);
                        })
                        .catch(err => {
                            reject(new DatabaseError(err));
                        });
                }
            })
            .catch(err => {
                reject(err);
            })
    );
};

const findBlogForPostUrl = (postUrl) => {
    return new Promise((resolve, reject) => {
        Blog.findOne({$where: "this.post_regex && RegExp(this.post_regex).test(\"" + postUrl + "\")"})
            .then(savedBlog => {
                if (savedBlog) {
                    resolve(savedBlog);
                } else {
                    reject(new Error("There is no Blog can handle this post."));
                }
            })
            .catch(err => {
                reject(new DatabaseError(err));
            })
    });
};

const existsUrl = (url) => {
    return new Promise(((resolve, reject) => {
        Blog.findOne({url: url})
            .then(savedBlog => {
                if (savedBlog) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(err => {
                reject(new DatabaseError(err));
            })
    }));
};

export default {
    saveBlog: saveBlog,
    existsUrl: existsUrl,
    findBlogForPostUrl: findBlogForPostUrl,
}
