class ExistsUrlError extends Error {

    constructor(message, url, type) {
        super(message);
        this.url = url;
        this.type = type;
    }
}

export default ExistsUrlError;