const multer = require('multer');
const path = require("path")
const uploadDir = 'uploads';
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(uploadDir, req.body.dir || 'default');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage ,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const validMime = ['jpeg','jpg','png','gif','pdf','pptx','ppt','video/webm','application/pdf','image/jpeg','image/png','image/gif','image/jpg','application/vnd.openxmlformats-officedocument.presentationml.presentation']
        if (validMime.includes(file.mimetype)) {
            return cb(null, true);
        } else {
            cb('Error: File type not supported');
        }
    }
});

module.exports = upload