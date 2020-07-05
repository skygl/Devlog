import jwtModule from '../config/jwt';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;

export const authorizeAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwtModule.verify(token);
        if (decoded.id !== ADMIN_USERNAME) {
            res.status(401).end();
            return;
        }
        next();
    } catch (error) {
        res.status(401).end();
    }
};
