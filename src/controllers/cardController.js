const Card = require('../models/card');
const List = require('../models/list');
const User = require('../models/user');
const render = require('../configs/render');

class CardController {

    get = async (req, res, next) => {
        try {
        const listId = req.params.id;
        render(req, res, 'createCard', {listId});
        } catch (error) {
            throw error;
        }
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
            throw error;
        }
    };

    detail = async (req, res, next) => {
        try {
            
            const card = await Card.findById({_id: req.params.id});
            const listId = card.listId;
            const lists = await List.findById({_id: listId});

            render(req, res, 'cardDetail', { card, lists });
        } catch (error) {
            throw error;
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
            throw error;
        }
    }

    addFIle = async (req, res, next) => {
        try {
            const cardId = req.params.id;
            const card = await Card.findById(cardId);
            render(req, res, 'add-card', {card});
        } catch (error) {
            throw error;
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
            throw error;
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
            throw error;
        }
    }

    member = async (req, res, next) => {
        try {
            const cardId = req.params.id;
            // const card = await Card.findById(cardId);

            render(req, res, 'add-member', {cardId} );

        } catch (error) {
            throw error;
        }
    }

    async addMember(req, res, next) {
        try {
            const cardId = req.params.id;
            const memberUsername = req.body.member;

            // Tìm card
            const card = await Card.findById(cardId);

            if (!card) {
                return res.status(404).render('add-member', { errMessage: 'Thẻ không tồn tại' });
            }
            // Kiểm tra xem thành viên đã tồn tại trong card hay chưa
            if (card.members && card.members.some(existingMember => existingMember.username === memberUsername)) {
                return res.status(400).render('add-member', { cardId, errMessage: 'Thành viên đã được thêm vào thẻ' });
            }

            if ( req.username === memberUsername ) {
                return res.status(400).render('add-member', {cardId, errMessage: 'Không thể thêm chính mình vào thẻ' });
            }

            const member = await User.findOne({ username: memberUsername });
            if (!member) {
                return res.status(404).render('add-member', { cardId, errMessage: 'Thành viên không tồn tại' });
            }
            
            // Thêm thành viên
            const newMember = {
                userId: member._id,
                username: member.username
            };

            card.members.push(newMember);
            await card.save();

            member.cards.push(card._id);
            await member.save();
      
        // Trả về phản hồi
        return res.redirect(`/${cardId}/card-detail`);

        } catch (error) {
            console.error('Lỗi thêm thành viên:', error.message);
            if (error.name === 'CastError') {
                return res.status(400).render('add-member', {cardId, errMessage: 'ID thẻ hoặc ID thành viên không hợp lệ' });
          }
            return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    }
}

module.exports = new CardController;