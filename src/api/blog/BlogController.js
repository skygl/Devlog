import {DuplicatedBlogUrlExistsError} from "../../services/blog/error/error";
import BlogService from "../../services/blog/BlogService";
import {handleCommonError} from "../commons";

export default {

    async createBlog(req, res, next) {
        BlogService.saveBlog(req.body)
            .then((blog) => {
                req.result = {
                    status: 200,
                    json: {...blog, id: blog._id},
                };
                next();
            })
            .catch(error => {
                if (error instanceof DuplicatedBlogUrlExistsError) {
                    req.result = {
                        status: 409,
                    };
                    req.error = {
                        error: "DuplicatedBlogUrlExistsError",
                        message: 'Duplicated blog URL already exists.'
                    };
                } else {
                    handleCommonError(req, error);
                }
                next();
            })
    },

    async getList(req, res, next) {
        BlogService.getList(
            {
                _sort: req.query._sort,
                _start: parseInt(req.query._start),
                _end: parseInt(req.query._end),
                _order: req.query._order,
                url: req.query.url
            })
            .then(result => {
                res.set('X-Total-Count', result.count);
                req.result = {
                    status: 200,
                    json: result.data.map(record => ({...record, id: record._id})),
                };
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    },

    async getOne(req, res, next) {
        BlogService.getOne({id: req.params.id})
            .then(blog => {
                req.result = {
                    status: 200,
                    json: {...blog, id: blog._id},
                };
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    },

    async update(req, res, next) {
        BlogService.update({data: req.body})
            .then(result => {
                req.result = {
                    status: 200,
                    json: {...result}
                };
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    },

    async delete(req, res, next) {
        BlogService.delete({id: req.params.id})
            .then(deletedBlog => {
                req.result = {
                    status: 200,
                    json: {...deletedBlog}
                };
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    }
}