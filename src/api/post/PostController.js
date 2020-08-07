import PostService from "../../services/post/PostService";
import {handleCommonError} from "../commons";

export default {

    async getList(req, res, next) {
        PostService.getList({
            sort: req.query._sort,
            start: parseInt(req.query._start),
            end: parseInt(req.query._end),
            order: req.query._order,
            url: req.query.url,
            score: req.query.score,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            unscored: req.query.unscored,
        })
            .then(result => {
                res.set('X-Total-Count', result.count);
                req.result = {
                    status: 200,
                    json: result.data.map(record => ({...record, id: record._id}))
                };
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    },

    async getOne(req, res, next) {
        PostService.getOne({id: req.params.id})
            .then(result => {
                if (result.exists) {
                    req.result = {
                        status: 200,
                        json: {...result.post, id: result.post._id},
                    };
                } else {
                    req.result = {
                        status: 404,
                    };
                    req.error = {
                        error: "PostNotFoundError",
                        message: "Cannot found post with given id in database",
                        id: req.params.id,
                    }
                }
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    },

    async update(req, res, next) {
        PostService.update({id: req.params.id, score: req.body.score})
            .then(result => {
                const {exists, ...json} = result;
                if (exists) {
                    req.result = {
                        status: 200,
                        json: json
                    };
                } else {
                    req.result = {
                        status: 404,
                    };
                    req.error = {
                        error: "PostNotFoundError",
                        message: "Cannot found post with given id in database",
                        id: req.params.id,
                    }
                }
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    },

    async delete(req, res, next) {
        PostService.delete({id: req.params.id})
            .then(deletedPost => {
                const {exists, ...json} = deletedPost;
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
                        error: "PostNotFoundError",
                        message: "Cannot found post with given id in database",
                        id: req.params.id,
                    };
                }
                next();
            })
            .catch(error => {
                handleCommonError(req, error);
                next();
            })
    }
}