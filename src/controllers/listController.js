const List = require('../models/list');
const Board = require('../models/board');
const render = require('../configs/render');


class ListController {

    get = async (req, res, next) => {
        const boardId = req.params.id;
        render(req, res, 'createList', {boardId});
    }

    create = async (req, res, next) => {
        
        const boardId = req.params.id;
        const title = req.body.title;

        try {
            const newList = new List({ title, boardId });

            await newList.save();
            
            const board = await Board.findByIdAndUpdate(
                boardId,
                { $push: { lists: newList._id } },
            );

            // // Truyền danh sách và thông tin bảng vào tệp Pug
            res.redirect(`/board/detail/${board.id}`);
        } catch (error) {
            throw error;
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
            throw error;
        }
    }

    edit = async (req, res, next) => {
        try {
            const lists = await List.findById(req.params.id);
            render(req, res, 'editlist', {lists});
        } catch (error) {
            throw error;
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
            throw error;
        }
    }
}

module.exports = new ListController;
