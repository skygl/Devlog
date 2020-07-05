import jwtObj from '../../config/jwt';
import jwt from 'jsonwebtoken';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default {

    async login(req, res) {
        const [username, password] = [req.body.username, req.body.password];
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = jwt.sign({id: ADMIN_USERNAME}, jwtObj.secret, {
                expiresIn: '30m'
            });
            res.json({token});
        } else {
            res.status(400).json({message: 'You entered wrong username or password'});
        }
    }
}
