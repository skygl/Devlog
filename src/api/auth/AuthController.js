import jwtModule from '../../config/jwt';
import {generateLog} from "../commons";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default {

    async login(req, res) {
        const [username, password] = [req.body.username, req.body.password];
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = jwtModule.sign({id: ADMIN_USERNAME}, {
                expiresIn: '30m'
            });
            generateLog({
                req: req, status: 200
            });
            res.json({token});
        } else {
            generateLog({
                req: req, status: 400, error: {
                    error: 'AuthenticationError',
                    message: 'Enter wrong username or password',
                }
            });
            res.status(400).json({message: 'You entered wrong username or password'});
        }
    }
}
