const board = require('../models/board')
const render = require('../configs/render');
const User = require('../models/user');

class SiteController {
    get = async (req, res, next) => {
        try {
            const user = await User.findOne({ username: req.username });

            if (!user) {
                return render(req, res, 'site', { boards: [] });
            }

            const boards = await board.find({ userId: user._id });

            // Chuyển giá trị username vào payload
            render(req, res, 'site', { boards });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new SiteController();

