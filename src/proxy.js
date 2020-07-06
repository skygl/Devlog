import axios from 'axios';

const proxy = (req, res) => {
    const url = req.query.url;
    axios.get(url)
        .then(response => {
            res.status(response.status).send(response.data);
        })
        .catch(error => {
            res.status(error.response.status).end();
        })
};

export default proxy;