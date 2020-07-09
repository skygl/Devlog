import BlogReqService from "../../services/blogreq/BlogReqService";
import {ExistsUrlError} from "../../services/blogreq/error/error";
import {DuplicatedBlogUrlExistsError} from "../../services/blog/error/error";
import {handleCommonError} from "../commons";

export default {

    async create(req, res, next) {
        BlogReqService.createBlogReq(req.body)
            .then(blogReq => {
                req.result = {
                    status: 200,
                    json: {...blogReq, id: blogReq._id}
                };
                next();
            })
            .catch(error => {
                if (error instanceof ExistsUrlError) {
                    req.result = {
                        status: 409,
                        json: {
                            type: error.type,
                        }
                    };
                    req.error = {
                        error: "ExistsUrlError",
                        message: `There is a ${error.type} having requested url`,
                    };
                } else {
                    handleCommonError(req, error);
                }
                next();
            });
    },

    async getList(req, res, next) {
        BlogReqService.getList({
            _sort: req.query._sort,
            _start: parseInt(req.query._start),
            _end: parseInt(req.query._end),
            _order: req.query._order,
            url: req.query.url,
            status: req.query.status
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
        BlogReqService.getOne({id: req.params.id})
            .then(result => {
                const {exists, post} = result;
                if (exists) {
                    req.result = {
                        status: 200,
                        json: {...post, id: post._id},
                    };
                } else {
                    req.result = {
                        status: 404,
                    };
                    req.errror = {
                        error: "BlogReqNotFoundError",
                        message: "Cannot found blog request with given id in database",
                        id: req.params.id,
                    };
                }
                next()
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    },

    async update(req, res, next) {
        BlogReqService.update({data: req.body, session: req.session})
            .then(result => {
                const {exists, ...json} = result;
                if (result.exists) {
                    req.result = {
                        status: 200,
                        json: json
                    };
                    req.success = true;
                } else {
                    req.result = {
                        status: 404,
                    };
                    req.errror = {
                        error: "BlogReqNotFoundError",
                        message: "Cannot found blog request with given id in database",
                        id: req.params.id,
                    };
                }
                next()
            })
            .catch(error => {
                if (error instanceof DuplicatedBlogUrlExistsError) {
                    req.result = {
                        status: 409
                    };
                    req.success = false;
                    req.error = {
                        error: "DuplicatedBlogUrlExistsError",
                        message: "Duplicated blog URL already exists."
                    };
                } else {
                    req.success = false;
                    handleCommonError(req, error);
                }
                next();
            })
    },

    async delete(req, res, next) {
        BlogReqService.delete({id: req.params.id})
            .then(deletedBlogReq => {
                const {exists, ...json} = deletedBlogReq;
                if (exists) {
                    req.result = {
                        status: 200,
                        json: json,
                    };
                } else {
                    req.result = {
                        status: 404,
                    };
                    req.errror = {
                        error: "BlogReqNotFoundError",
                        message: "Cannot found blog request with given id in database",
                        id: req.params.id,
                    };
                }
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    },

    async exists(req, res, next) {
        BlogReqService.existsUrl(req.query.url)
            .then(exist => {
                req.result = {
                    status: 200,
                    json: {
                        exists: exist.exists,
                        type: exist.type,
                    },
                };
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    }
}