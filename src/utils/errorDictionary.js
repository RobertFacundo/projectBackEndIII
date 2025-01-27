const errorDictionary = {
    INVALID_PARAM: {
        message: 'El parámetro proporcionado no es válido.',
        code: 400,
        suggestion: 'Verifica los parámetros enviados. Deben ser válidos y en el formato correcto.',
    },
    DATABASE_ERROR: {
        message: 'Hubo un problema al conectar con la base de datos.',
        code: 500,
        suggestion: 'Contacta al administrador o verifica la conexión con la base de datos.',
    },
    USER_NOT_FOUND: {
        message: 'No se encontró el usuario.',
        code: 404,
        suggestion: 'Asegúrate de que el usuario existe antes de realizar esta operación.',
    },
    PET_NOT_FOUND: {
        message: 'No se ha encontrado la mascota',
        code: 402,
        suggestion: 'Asegurate que la PetId es correcta',
    }

}

export default errorDictionary;