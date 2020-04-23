import DomService from "../../services/dom/DomService";
import {DatabaseError} from "../../services/error/error";
import {DuplicatedPostUrlExistsError, HTMLParseError} from "../../services/dom/error/error";

export default {

    async scoreDom(req, res) {
        DomService.scoreUnsavedDom(req.body)
            .then(result => res.json(result))
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                } else if (error instanceof DuplicatedPostUrlExistsError) {
                    return res.status(409).json({message: error.message});
                } else if (error instanceof HTMLParseError) {
                    return res.status(500).json({message: error.message});
                } else {
                    console.error({
                        Message: "Unexpected Error Occurred While Scoring Dom.",
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