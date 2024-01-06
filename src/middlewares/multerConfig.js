const multer = require('multer');

// Cấu hình cho việc upload cover
const coverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = 'src/public/img/cover';
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const coverUpload = multer({ storage: coverStorage });

// Cấu hình cho việc upload file
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = 'src/public/uploads'; // Đường dẫn tới thư mục lưu trữ file
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const fileUpload = multer({ storage: fileStorage });

module.exports = {
    coverUpload,
    fileUpload
};
