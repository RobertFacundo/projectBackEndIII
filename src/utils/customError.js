class CustomError extends Error {
    constructor(code, dictionaryEntry, cause = null) {
        super(dictionaryEntry.message);
        this.code = code;
        this.name = this.constructor.name;
        this.cause = cause ? cause.message : null;
        this.statusCode = dictionaryEntry.code || 500;
    }
}

const createError = (code, dictionaryEntry, cause = null) => {
    const error = new CustomError(code, dictionaryEntry, cause);
    console.log(error);
    return error;
};

export { createError, CustomError };