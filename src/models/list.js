const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    title: {type: String},
    createDate : {type: Date, default: Date.now},  
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    cards: [{ type: mongoose.Schema.Types.ObjectId, 
        ref: 'Card'
    }],
});

const List = mongoose.model('List', listSchema);
module.exports = List;