const board = require('../models/board')


class SiteController {
    get = async (req, res, next) => {
        try {
            const boards  = await board.find({});
            res.render('site', {boards});
        } catch (error) {
            res.status(500).json({msg: "Lỗi"});
        }
    }
}

module.exports = new SiteController();

