const List = require('../models/list');
const Board = require('../models/board');

class ListController {
    create = async (req, res, next) => {
        const { title, boardId } = req.body;
        try {
            const newList = new List({ title, boardId });

            await newList.save();
    
            const updatedBoard = await Board.findByIdAndUpdate(
                boardId,
                { $push: { lists: newList._id } },
                { new: true }
            );

            // Lấy thông tin chi tiết của toàn bộ danh sách
            const lists = await List.find({ _id: { $in: updatedBoard.lists } });

            // // Truyền danh sách và thông tin bảng vào tệp Pug
            res.render('detail', {board :updatedBoard, lists });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }

    delete = async (req, res, next) => {
        try {
            const listId = req.params.id;
            await Board.updateOne(
                { lists: listId},
                {$pull: {lists: listId}}
            )

            await List.findByIdAndDelete(listId);
            res.redirect('back');
        } catch (error) {
            res.status(500).send('Internal Server Error');
        }
    }

    edit = async (req, res, next) => {
        try {
            const lists = await List.findById(req.params.id);
            res.render('editlist', {lists});
        } catch (error) {
            console.error('Error fetching lists:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    update = async (req, res, next) => {
        try {
            const formData = req.body;
            const listId = req.params.id;
            await List.updateOne({_id: listId}, formData);
            const updateList = await List.findById(listId);

            res.redirect(`/board/detail/${updateList.boardId}`);
        } catch (error) {
            console.error('Error fetching List:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new ListController;
