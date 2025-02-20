class CustomError extends Error {
    constructor(code, dictionaryEntry, cause = null) {
        // Validación de que dictionaryEntry tenga la propiedad 'message'
        if (!dictionaryEntry || !dictionaryEntry.message) {
            throw new Error('dictionaryEntry must contain a message property.');
        }

        super(dictionaryEntry.message);
        this.code = code;
        this.name = this.constructor.name;
        this.cause = cause ? cause.message : null;
        this.statusCode = dictionaryEntry.code || 500;
        this.suggestion = dictionaryEntry.suggestion || null;  
    }
}

const createError = (code, dictionaryEntry, cause = null) => {
    // Crear una nueva instancia de CustomError
    const error = new CustomError(code, dictionaryEntry, cause);
    console.log(error);  // Para depuración: ver el error completo
    return error;
};

export { createError, CustomError };