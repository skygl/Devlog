import axios from 'axios';

const proxy = (req, res) => {
    const url = req.query.url;
    axios.get(url)
        .then(response => {
            res.status(response.status).send(response.data);
        })
};

export default proxy;