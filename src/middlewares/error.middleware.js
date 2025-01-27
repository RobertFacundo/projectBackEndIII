import { CustomError } from "../utils/customError.js";
import errorDictionary from "../utils/errorDictionary.js";

const errorMiddleware = (err, req, res, next) => {
    if (err instanceof CustomError) {
        const { code, message, suggestion } = errorDictionary[err.code] || {};

        const statusCode = err.statusCode || 500;

        return res.status(statusCode).json({
            error: err.code,
            message: message || err.message,
            suggestion: suggestion || null,
            cause: err.cause || null,
        });
    }

    return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Algo salió mal, por favor inténtalo de nuevo más tarde.',
    });
};

export default errorMiddleware;