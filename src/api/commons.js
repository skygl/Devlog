import {validationResult} from "express-validator";
import mongoose from "mongoose";
import {DatabaseError} from "../services/error/error";

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
        .catch(() => {
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
    if (data) {
        res.json(data);
        return;
    }
    res.end();
};