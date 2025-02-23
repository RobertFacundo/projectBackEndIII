import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const getDestination = (file, userId) => {
    if (file.mimetype.startsWith('image')) {
        return 'products';
    } else {
        return 'documents';
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.params.uid;
        const folder = getDestination(file);
        const uploadPath = path.resolve('src', 'public', userId, folder);

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