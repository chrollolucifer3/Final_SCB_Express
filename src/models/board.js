const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    title: {type: String},
    createDate : {type: Date, default: Date.now},
    lists: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'List' 
    }],
    cover: {type: String},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
})


const Board = mongoose.model('Board', boardSchema);
module.exports = Board;