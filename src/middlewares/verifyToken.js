const jwt = require('jsonwebtoken');

verifyToken = (req, res, next) => {
    // Lấy token từ cookie 
    let token = req.cookies.token;

    if (!token) {
        return res.status(401).send({ error: true, message: "Token không được cung cấp" });
    }

    // Xác thực token sử dụng khóa bí mật
    jwt.verify(token, process.env.KEY_JWT, async (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: "Từ chối truy cập" });
        }

        req.username = decoded.username;
        next();
    });
};

module.exports = verifyToken;
