const copy = (o) => {
    return JSON.parse(JSON.stringify(o));
};

module.exports = copy;