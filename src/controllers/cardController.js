const Card = require('../models/card');

class CardController {

    get = async (req, res, next) => {
        res.render('createCard');
    }

    create = async (req, res, next) => {
        try {
            if(!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            } else {
                req.body.attachment = req.file.attachment;
                req.body.cover = req.file.cover;
                await Card.create(req.body);
                res.redirect('/');
            }

        } catch (error) {
            console.error('Error creating board:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new CardController;