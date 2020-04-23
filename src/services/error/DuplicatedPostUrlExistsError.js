class DuplicatedPostUrlExistsError extends Error {

    constructor() {
        super('Duplicated Post Url Already Exists.');
    }
}

export default DuplicatedPostUrlExistsError;