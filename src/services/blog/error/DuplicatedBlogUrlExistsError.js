class DuplicatedBlogUrlExistsError extends Error {

    constructor() {
        super('Duplicated Blog Url Already Exists.');
    }
}

export default DuplicatedBlogUrlExistsError;