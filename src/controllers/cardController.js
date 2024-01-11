const render = require('../configs/render')
const Card = require('../models/card');
const List = require('../models/list');
const User = require('../models/user');

class CardController {

    get = async (req, res, next) => {
        const listId = req.params.id;
        res.render('createCard', {listId});
    }

    create = async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            } else {
                const { title, description, dueDate } = req.body;
                const listId = req.params.id; // Lấy listId từ params
                // Truy vấn cơ sở dữ liệu để lấy boardId từ listId
                const list = await List.findById(listId);
                if (!list) {
                    return res.status(404).json({ error: 'List not found' });
                }

                const user = await User.findOne({username: req.username});
    
                const boardId = list.boardId;
                
                // Tạo mới card
                const newCard = await Card.create({
                    title,
                    description,
                    dueDate,
                    cover: req.file.filename,
                    author: user.fullname,
                    boardId,
                    listId,
                });

                await List.findByIdAndUpdate(
                    listId,
                    {$push: { cards: newCard._id }}
                );
    
                res.redirect(`/board/detail/${boardId}`);
            }
        } catch (error) {
            console.error('Error creating card:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    detail = async (req, res, next) => {
        try {
            
            const card = await Card.findById({_id: req.params.id});
            const listId = card.listId;
            const lists = await List.findById({_id: listId});

            render(req, res, 'cardDetail', { card, lists });
        } catch (error) {
            console.error('Error creating card:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    deleteCard = async (req, res, next) => {
        try {
            const cardId = req.params.id;
            await List.updateOne(
                {cards : cardId},
                {$pull: {cards: cardId}}
            )

            await Card.findByIdAndDelete(cardId);
            res.redirect('back')
        } catch (error) {
            console.error('Error creating card:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    addFIle = async (req, res, next) => {
        try {
            const cardId = req.params.id;
            const card = await Card.findById(cardId);
            render(req, res, 'add-card', {card});
        } catch (error) {
            console.error('Error add attachment:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    updateAttachment = async (req, res, next) => {
        try {
            const cardId = req.params.id;
            
            const filename = req.file.originalname;
            const filePath = req.file.path;
            
            const card = await Card.findById(cardId);
            
            card.attachments.push({filename, filePath});

            await card.save();

            res.redirect(`/${cardId}/card-detail`);
        } catch (error) {
            console.error('Error add attachment:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    updateDescription = async (req, res, next) => {
        try {
            const cardId = req.params.id;
            const cardDescription = req.body.description;

            await Card.findOneAndUpdate(
                { _id: cardId },
                { $set: { description: cardDescription } },
            );

            res.redirect(`/${cardId}/card-detail`);
        } catch (error) {
            console.error('Error add attachment:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new CardController;