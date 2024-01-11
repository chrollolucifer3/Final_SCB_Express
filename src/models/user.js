const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullname: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    boards : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    }],
    cards: [{
         type: mongoose.Schema.Types.ObjectId, ref: 'Card'
    }],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
