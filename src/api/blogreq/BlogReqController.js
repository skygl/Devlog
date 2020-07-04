import BlogReqService from "../../services/blogreq/BlogReqService";
import {DatabaseError} from "../../services/error/error";
import {ExistsUrlError} from "../../services/blogreq/error/error";
import logger from "../../utils/Logger";

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
                    return res.status(409).json({message: error.message});
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
    }
}