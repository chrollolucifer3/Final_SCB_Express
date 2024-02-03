function render(req, res, view, payload) {

    res.render(view, {...payload, username: req.username});
}

module.exports = render;