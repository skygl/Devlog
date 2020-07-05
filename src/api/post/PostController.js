import PostService from "../../services/post/PostService";
import {DatabaseError} from "../../services/error/error";
import logger from "../../utils/Logger";

export default {

    async getList(req, res) {
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
                res.json(result.data.map(record => {
                    record = {...record, id: record._id};
                    return record;
                }))
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    console.log(error.error.message)
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Reading Posts.",
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
        PostService.getOne({id: req.params.id})
            .then(post => {
                res.json({...post, id: post._id})
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Reading Post.",
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
        PostService.update({id: req.body.id, score: req.body.score})
            .then(result => {
                return {...result};
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                }
                logger.error(JSON.stringify({
                    Message: "Unexpected Error Occurred While Updating Post.",
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