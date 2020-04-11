class DuplicatedUrlExistsError extends Error {

    constructor() {
        super('Duplicated Url Already Exists.');
    }
}

export default DuplicatedUrlExistsError;