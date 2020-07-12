import axios from 'axios';
import {generateLog} from "./api/commons";

const proxy = (req, res) => {
    const url = req.query.url;
    axios.get(url)
        .then(response => {
            generateLog({
                req: req, status: response.status
            });
            res.status(200).json({
                status: response.status,
                html: response.data,
            });
        })
        .catch(error => {
            generateLog({
                req: req, status: error.response.status, error: {
                    error: "AxiosHttpError",
                    message: error.message,
                }
            });
            res.status(200).json({status: error.response.status});
        })
};

export default proxy;