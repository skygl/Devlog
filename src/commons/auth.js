import jwtModule from '../config/jwt';
import {generateLog} from "../api/commons";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;

export const authorizeAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwtModule.verify(token);
        if (decoded.id !== ADMIN_USERNAME) {
            generateLog({
                req: req, status: 401, error: {
                    error: "AuthorizationError",
                    message: "Token is not admin's"
                }
            });
            res.status(401).end();
            return;
        }
        next();
    } catch (error) {
        generateLog({
            req: req, status: 401, error: {
                error: "AuthorizationError",
                message: "Token is invalid or not exists"
            }
        });
        res.status(401).end();
    }
};
