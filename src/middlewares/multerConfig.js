const multer = require('multer');
const path = require('path');

// Cấu hình cho việc upload cover
const coverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = 'src/public/img/cover';
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const coverUpload = multer({ storage: coverStorage });

// Cấu hình cho việc upload file
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = 'src/public/attachment'; // Đường dẫn tới thư mục lưu trữ file
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileUpload = multer({ storage: fileStorage });

module.exports = {
    coverUpload,
    fileUpload
};
