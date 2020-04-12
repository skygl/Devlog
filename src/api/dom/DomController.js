import DomService from "../../services/dom/DomService";
import {DatabaseError} from "../../services/error/error";

export default {

    async createDom(req, res) {
        DomService.saveDom(req.body)
            .then(result => res.json(result))
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                } else {
                    console.error({
                        Message: "Unexpected Error Occurred While Creating Dom.",
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