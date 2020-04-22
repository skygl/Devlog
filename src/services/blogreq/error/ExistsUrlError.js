class ExistsUrlError extends Error {

    constructor(message, url) {
        super(message);
        this.url = url;
    }
}

export default ExistsUrlError;