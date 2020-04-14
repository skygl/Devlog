class NotExistsHandleableBlogError extends Error {

    constructor() {
        super('There is No Handleable Blog!');
    }
}

export default NotExistsHandleableBlogError;