import multer from 'multer';
import path from 'path';

const uploadPath = path.resolve('src', 'public', 'img'); 

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

const uploader = multer({ storage: storage });

export default uploader;