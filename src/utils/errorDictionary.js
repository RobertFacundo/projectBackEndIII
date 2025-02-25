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
    PRODUCT_NOT_FOUND: {
        message: 'Producto no encontrado',
        code: 404,
        suggestion: 'Asegurate que la id es correcta'
    },
    USER_ALREADY_EXISTS:{
        message: 'Usuario ya existe',
        code: 500,
        suggestion: 'Invoca otros valores'
    },
    PRODUCT_NOT_IN_CART:{
        message: 'Producto no encontrado en el carro',
        code:404,
        suggestion: 'Intenta con otro product ID'
    },
    NOT_FILES_UPLOADED:{
        message: 'No se han subido los archivos',
        code: 400,
        suggestion:'Intenta subir imagenes o documentos'
    },
    CART_NOT_FOUND:{
        message: 'No se ha encontrado el carro',
        code: 404,
        suggestion: 'Intenta con un CID valido'
    },
    CART_ALREADY_EXISTS:{
        message: 'El usuario ya tiene un carro asociado a su id',
        code:500,
        suggestion: 'Intenta otro user id o prueba en pos1tman un nuevo objectID de mongoose'
    }

}

export default errorDictionary;