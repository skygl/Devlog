import axios from 'axios';
import {generateLog} from "./api/commons";

const proxy = (req, res) => {
    const url = req.query.url;
    axios.get(url)
        .then(response => {
            generateLog({
                req: req, status: response.status
            });
            res.status(response.status).send(response.data);
        })
        .catch(error => {
            generateLog({
                req: req, status: error.response.status, error: {
                    error: "AxiosHttpError",
                    message: error.message,
                }
            });
            res.status(error.response.status).end();
        })
};

export default proxy;