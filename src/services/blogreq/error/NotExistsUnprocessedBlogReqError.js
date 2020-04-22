class NotExistsUnprocessedBlogReqError extends Error {

    constructor() {
        super("There is no Unprocessed BlogRequest.");
    }
}

export default NotExistsUnprocessedBlogReqError;