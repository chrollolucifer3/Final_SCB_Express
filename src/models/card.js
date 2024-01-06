const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
    dueDate: { type: Date },
    cover: { type: String },
    attachments: [{
        filename: { type: String, required: true },
        filePath: { type: String, required: true },
    }],
    createDate: { type: Date, default: Date.now },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true }
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;
