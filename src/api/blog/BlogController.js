import {DatabaseError} from "../../services/error/error";
import {DuplicatedUrlExistsError} from "../../services/blog/error/error";
import BlogService from "../../services/blog/BlogService";

export default {

    async createBlog(req, res) {
        BlogService.saveBlog(req.body)
            .then(() => {
                res.json({
                    success: true,
                    message: 'Blog is Created.'
                });
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                } else if (error instanceof DuplicatedUrlExistsError) {
                    return res.status(409).json({message: error.message});
                } else {
                    console.error({
                        Message: "Unexpected Error Occurred While Creating Blog.",
                        Details: error.message,
                        Date: Date().toString(),
                        Url: req.baseUrl,
                        Headers: req.headers,
                        Body: req.body
                    });
                    return res.status(500).end();
                }
            });
    }
}