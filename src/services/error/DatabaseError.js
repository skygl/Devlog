class DatabaseError extends Error {

    constructor(error) {
        super('Database Error Occurs.');
        this.error = error;
    }
}

export default DatabaseError;