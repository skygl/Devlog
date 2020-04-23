class BlogReqAlreadyProcessedError extends Error {

    constructor(url) {
        super("The Requested BlogReq is Already Processed.");
        this.url = url;
    }
}

export default BlogReqAlreadyProcessedError;