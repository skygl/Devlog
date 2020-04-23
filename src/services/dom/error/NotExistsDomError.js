class NotExistsDomError extends Error {

    constructor(url) {
        super("The Requested Dom does not Exists.");
        this.url = url;
    }
}

export default NotExistsDomError;