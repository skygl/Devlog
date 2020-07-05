import './env';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;

const jwtModule = {
    sign: (payload, options) => jwt.sign(payload, secret, options),
};

module.exports = jwtModule;