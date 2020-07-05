import './env';

const jwtObj = {
    secret: process.env.JWT_SECRET
};

module.exports = jwtObj;