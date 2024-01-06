const board = require('../models/board');
const List = require('../models/list')

class BoardController {

    get = async (req, res, next) => {
        res.render('createboard');
    }

    create = async (req, res, next) => {
        try {
            if(!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            } else {
                req.body.cover = req.file.filename;
                await board.create(req.body);
                res.redirect('/');
            }

        } catch (error) {
            console.error('Error creating board:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    edit = async (req, res, next) => {
        try {
            const boards = await board.findById(req.params.id);
            res.render('editboard', { boards });
        } catch (error) {
            console.error('Error fetching boards:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    update = async (req, res, next) => {
        try {
            const formData = req.body;

            const fileName = req.file.filename;
            await board.updateOne({_id: req.params.id}, {...formData, cover: fileName });
            res.redirect('/');
        } catch (error) {
            console.error('Error fetching boards:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    delete = async (req, res, next) => {
        try {
            const boardID = req.params.id;
            const boardDetail  = await board.findById(boardID);
            
            // Xóa danh sách trước khi xóa bảng
            await List.deleteMany({ _id: { $in: boardDetail.lists } });
    
            // Sau đó xóa bảng
            await board.deleteOne({ _id: boardID });
            
            res.redirect('back');
        } catch (error) {
            console.error('Error deleting board:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    

    detail = async (req, res, next) => {
        try {
            const boardDetail = await board.findById(req.params.id);
            const lists = await List.find({ _id: { $in: boardDetail.lists } });
            res.render('detail', { board: boardDetail, lists });
        } catch (error) {
            console.error('Error fetching board detail:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
    
}

module.exports = new BoardController;