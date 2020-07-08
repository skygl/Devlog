import {validationResult} from "express-validator";
import mongoose from "mongoose";
import {DatabaseError} from "../services/error/error";
import logger from "../utils/Logger";
import moment from "moment";

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        generateLog({req: req, status: 422, error: errors.array()});
        return res.status(422).json({
            errors: errors.array()
        });
    }
    next();
};

export const beginTransaction = async (req, res, next) => {
    mongoose.startSession()
        .then(session => {
            session.startTransaction();
            req.session = session;
            req.success = false;
            next();
        })
        .catch((error) => {
            generateLog({
                req: req, status: 500, error: {
                    error: "TransactionBeginError",
                    message: error.message,
                }
            });
            res.status(500).end();
        })
};

export const endTransaction = async (req, res, next) => {
    try {
        const session = req.session;

        if (req.success) {
            await session.commitTransaction();
            session.endSession();
        } else {
            await session.abortTransaction();
            session.endSession();
        }
        next();
    } catch (e) {
        generateLog({
            req: req, status: 500, error: {
                error: "TransactionEndError",
                message: error.message,
            }
        });
        res.status(500).end();
    }
};

export const handleCommonError = (req, error) => {
    if (error instanceof DatabaseError) {
        req.result = {
            status: 500
        };
        req.error = {
            error: "DatabaseError",
            message: error.error.message,
        };
        return;
    }
    req.result = {
        status: 500
    };
    req.error = {
        error: "UnexpectedError",
        message: error.message,
    };
};

export const sendResponse = async (req, res) => {
    res.status(req.result.status);
    const data = req.result.json;
    generateLog({req: req, status: req.result.status, error: req.error});
    if (data) {
        res.json(data);
        return;
    }
    res.end();
};

export const generateLog = ({req, status, error}) => {
    const info = {
        type: 'API',
        method: req.method,
        url: req.baseUrl + req.path,
        status: status,
        ips: req.ips,
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
    Object.keys(req.body).length !== 0 && (info.body = req.body);
    Object.keys(req.params).length !== 0 && (info.params = req.params);
    Object.keys(req.query).length !== 0 && (info.query = req.query);
    if (error) {
        info.error = error;
        logger.error(JSON.stringify(info));
        return;
    }
    logger.info(JSON.stringify(info));
};