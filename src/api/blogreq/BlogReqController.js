import BlogReqService from "../../services/blogreq/BlogReqService";
import {DatabaseError} from "../../services/error/error";
import {ExistsUrlError} from "../../services/blogreq/error/error";
import logger from "../../utils/Logger";
import {DuplicatedBlogUrlExistsError} from "../../services/blog/error/error";

export default {

    async create(req, res) {
        BlogReqService.createBlogReq(req.body)
            .then(blogReq => {
                res.json({...blogReq, id: blogReq._id});
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                if (error instanceof ExistsUrlError) {
                    return res.status(409).json({message: error.message, type: error.type});
                }
                logger.error({
                    Message: "Unexpected Error Occurred While Creating Blog.",
                    Details: error.message,
                    Date: Date().toString(),
                    Url: req.baseUrl,
                    Headers: req.headers,
                    Body: req.body
                });
                return res.status(500).end();
            });
    },

    async getList(req, res) {
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
                res.json(result.data.map(record => {
                    record = {...record, id: record._id};
                    return record;
                }))
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Reading BlogRequests.",
                    Details: error.message,
                    Date: Date().toString(),
                    Url: req.baseUrl,
                    Headers: req.headers,
                    Body: req.body
                }));
                return res.status(500).end();
            })
    },

    async getOne(req, res) {
        BlogReqService.getOne({id: req.params.id})
            .then(blogReq => {
                res.json({...blogReq, id: blogReq._id})
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Reading BlogRequest.",
                    Details: error.message,
                    Date: Date().toString(),
                    Url: req.baseUrl,
                    Headers: req.headers,
                    Body: req.body
                }));
                return res.status(500).end();
            })
    },

    async update(req, res) {
        BlogReqService.update({data: req.body})
            .then(result => {
                return res.json({...result})
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                } else if (error instanceof DuplicatedBlogUrlExistsError) {
                    return res.status(409).json({message: error.message});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Updating BlogReq.",
                    Details: error.message,
                    Date: Date().toString(),
                    Url: req.baseUrl,
                    Headers: req.headers,
                    Body: req.body
                }));
                return res.status(500).end();
            })
    },

    async delete(req, res) {
        BlogReqService.delete({id: req.params.id})
            .then(deletedBlogReq => {
                res.json(deletedBlogReq)
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Deleting BlogReq.",
                    Details: error.message,
                    Date: Date().toString(),
                    Url: req.baseUrl,
                    Headers: req.headers,
                    Body: req.body
                }));
                return res.status(500).end();
            })
    },

    async exists(req, res) {
        console.log(req.query.url);
        BlogReqService.existsUrl(req.query.url)
            .then(exist => {
                res.status(200).json(exist)
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Checking Url Existence",
                    Details: error.message,
                    Date: Date().toString(),
                    Url: req.baseUrl,
                    Headers: req.headers,
                    Body: req.body
                }));
                return res.status(500).end();
            })
    }
}