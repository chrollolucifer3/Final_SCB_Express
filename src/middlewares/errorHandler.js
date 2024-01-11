const errHandler = (err, req, res, next) => {
    if(!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).json({
        status: 'error',
        errStatusCode: err.statusCode,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '' : err.stack
        
    });
}

module.exports = errHandler