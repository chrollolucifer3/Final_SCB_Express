const Board = require('../models/board');
const List = require('../models/list');
const User = require('../models/user');
const Card = require('../models/card');
const render = require('../configs/render');

class BoardController {

    get = async (req, res, next) => {
        render(req, res, 'createboard');
    }

    create = async (req, res, next) => {
        try {
            if(!req.file) {
                return render(req, res, 'createboard', { errMessage: 'No file uploaded' });
            } else {

                const user = await User.findOne({username: req.username});
                
                // Tạo board mới từ req.body
                const newBoard = new Board({
                    title: req.body.title,
                    cover: req.file.filename,
                    userId: user._id, // Lưu userId vào board
                });

                if (!user) {
                    return res.status(404).json({ errMessage: 'User not found' });
                }
    
                // Lưu boardid vào user
                user.boards.push(newBoard._id);
                await user.save();
    
                // Lưu board vào cơ sở dữ liệu
                await newBoard.save();
    
                res.redirect('/');
            }

        } catch (error) {
            console.error('Error during user creation:', error);

            // Truyền lỗi về middleware để xử lý trong route
            return next(error);
        }
    }

    edit = async (req, res, next) => {
        try {
            const boards = await Board.findById(req.params.id);
            render(req, res, 'editboard', { boards });
        } catch (error) {
            throw error;
        }
    }

    update = async (req, res, next) => {
        try {
            const formData = req.body;

            const fileName = req.file.filename;
            await Board.updateOne({_id: req.params.id}, {...formData, cover: fileName });
            res.redirect('/');
        } catch (error) {
            throw error;
        }
    }

    delete = async (req, res, next) => {
        try {

            const user = await User.findOne({username: req.username});
            const boardId = req.params.id;
            const boardDetail = await Board.findById(boardId).populate('lists');

            // Lặp qua từng danh sách và xóa tất cả các card trong danh sách đó
            for (const list of boardDetail.lists) {
                await Card.deleteMany({ listId: list._id });
            }
    
            // Sau đó xóa danh sách và bảng
            await List.deleteMany({ _id: { $in: boardDetail.lists } });
            await Board.deleteOne({ _id: boardId });
            await user.updateOne(
                { boards: boardId },
                { $pull: { boards: boardId } }
            );
            
            res.redirect('back');
        } catch (error) {
            throw error;
        }
    }
    

    detail = async (req, res, next) => {
        try {
            // Lấy thông tin board và sử dụng populate để lấy danh sách các list và cards
            const boardDetail = await Board.findById(req.params.id)
                .populate({
                    path: 'lists',
                    populate: {
                        path: 'cards',
                    },
                });
    
            // Lấy danh sách các list từ thông tin board
            const lists = boardDetail.lists;
    

            render(req, res, 'detail', { board: boardDetail, lists });
        } catch (error) {
            throw error;
        }
    };
    
}

module.exports = new BoardController;