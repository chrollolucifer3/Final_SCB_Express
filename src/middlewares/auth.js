const auth = (req, res, next)=> {
    if(req.username) {
        next();
    } else {
        res.render('login', {
            errMessage: 'You must login to perform operations', 
        });
    }
}

module.exports = auth;