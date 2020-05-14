import DomService from "../../services/dom/DomService";
import {DatabaseError, DuplicatedPostUrlExistsError} from "../../services/error/error";
import {HTMLParseError, NotExistsUnscoredDomError} from "../../services/dom/error/error";
import logger from "../../utils/Logger";

export default {

    async testDom(req, res) {
        DomService.testDom(req.body)
            .then(result => res.status(200).json(result))
            .catch(error => res.status(500).json({message: error.message}));
    },

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
                    logger.error({
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
    },

    async loadUnscoredDom(req, res) {
        DomService.findUnscoredDom()
            .then(dom => {
                res.status(200).json({url: dom.url, expected_score: dom.expected_score});
            })
            .catch(error => {
                if (error instanceof DatabaseError) {
                    return res.status(500).json({message: error.message, details: error.error});
                } else if (error instanceof NotExistsUnscoredDomError) {
                    return res.status(400).json({message: error.message})
                } else {
                    logger.error({
                        Message: "Unexpected Error Occurred While Scoring Dom.",
                        Details: error.message,
                        Date: Date().toString(),
                        Url: req.baseUrl,
                        Headers: req.headers,
                        Body: req.body
                    });
                    return res.status(500).end();
                }
            })
    }
}