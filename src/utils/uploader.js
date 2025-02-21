import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const getDestination = (file) => {
    if (file.mimetype.startsWith('image')) {
        return 'products';
    } else {
        return 'documents';
    }
};

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = getDestination(file);
        const uploadPath = path.resolve('src', 'public', folder);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

const uploader = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
}).array('files');

export default uploader;