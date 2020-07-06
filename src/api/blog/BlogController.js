import {DatabaseError} from "../../services/error/error";
import {DuplicatedBlogUrlExistsError} from "../../services/blog/error/error";
import BlogService from "../../services/blog/BlogService";
import logger from "../../utils/Logger";

export default {

    async createBlog(req, res) {
        BlogService.saveBlog(req.body)
            .then((blog) => {
                res.json({...blog, id: blog._id});
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                } else if (error instanceof DuplicatedBlogUrlExistsError) {
                    return res.status(409).json({message: error.message});
                } else {
                    logger.error({
                        Message: "Unexpected Error Occurred While Creating Blog.",
                        Details: error.message,
                        Date: Date().toString(),
                        Url: req.baseUrl,
                        Headers: req.headers,
                        Body: req.body
                    });
                    return res.status(500).end();
                }
            })
    },

    async getList(req, res) {
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
                    Message: "Unexpected Error Occurred While Reading Blog.",
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
        BlogService.getOne({id: req.params.id})
            .then(blog => {
                res.json({...blog, id: blog._id});
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Reading Blog.",
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
        BlogService.update({data: req.body})
            .then(result => {
                return {...result}
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Updating Blog.",
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
        BlogService.delete({id: req.params.id})
            .then(deletedBlog => {
                res.json(deletedBlog);
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Deleting Blog.",
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
        BlogService.existsUrl(req.query.url)
            .then(exist => {
                res.status(200).json({exists: exist})
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