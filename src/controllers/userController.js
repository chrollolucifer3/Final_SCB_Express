const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const render = require('../configs/render');
const Card = require('../models/card');

class UserController {
    get = async (req, res) => {
        res.render('login');
    }

    signUp = async (req, res) => {
        res.render('signup');
    }

    createUser = async (req, res, next) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            await User.create({
                username: req.body.username,
                password : hashedPassword,
                fullname: req.body.fullname,
                email: req.body.email,
                phone: req.body.phone,
            });

            res.redirect('login');
        } catch (error) {
            console.error('Error during user creation:', error);

            // Truyền lỗi về middleware để xử lý trong route
            return next(error);
        }
    }

    login = async (req, res, next) => {
        try {
            const { username, password } = req.body;

            // Tìm người dùng trong cơ sở dữ liệu
            const dbUser = await User.findOne({ username });

            if (dbUser) {
                // So sánh mật khẩu đã nhập với mật khẩu trong cơ sở dữ liệu
                const isPasswordValid = await bcrypt.compare(password, dbUser.password);

                if (isPasswordValid) {
                    // Tạo token và lưu vào cookie
                    const token = jwt.sign({ username: dbUser.username }, process.env.KEY_JWT);
                    res.cookie('token', token, { httpOnly: true });
                    res.redirect('/');
                } else {
                    res.render('login', { errMessage: 'Invalid password' });
                }
            } else {
                res.render('login', { errMessage: `${req.body.username} not existed` });
            }
        } catch (error) {
            throw error;
        }
    };

    logOut = async (req, res, next) => {
        res.clearCookie('token');
        res.redirect('/');
    }

    manageUser = async (req, res, next) => {
        try {

            const user = await User.findOne({username: req.username});

            render(req, res, 'manageUser', {user}); 
        } catch (error) {
            throw error;
        }
    }

    getChange = async (req, res, next) => {
        try {
            render(req, res, 'changepassword'); 
        } catch (error) {
            throw error;
        }
    }

    updatePassword = async (req, res, next) => {
        try {
            const {currentPassword, newPassword, confirmNewPassword  } = req.body;

            const user = await User.findOne({username: req.username});

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch) {
                return render(req, res, 'changepassword', { errMessage: 'Mật khẩu hiện tại không đúng' } );
            }

            if(newPassword !== confirmNewPassword) {
                return render(req, res, 'changepassword', { errMessage: 'Mật khẩu mới và mật khẩu nhập lại không khớp.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;

            await user.save();
            res.clearCookie('token');

            res.render('login')
            
        } catch (error) {
            console.error('Error during password change:', error);
            return next(error);
        }
    }

    getCard = async (req, res, next) => {
        try {
            const user = await User.findOne({ username: req.username }).populate('cards');
            const cards = user.cards;

            render(req, res, 'managerCard', {cards});
        } catch (error) {
            throw error;
        }
    }

    deleteCard = async (req, res, next) => {
        try {
            const cardId = req.params.id; 

            const user = await User.findOne({ username: req.username });

            const card = await Card.findOne({ _id: cardId });
            // Xóa card khỏi mảng cards của user
            user.cards = user.cards.filter(userCardId => userCardId.toString() !== cardId);
    
            // Lưu thay đổi vào cơ sở dữ liệu cho user
            await user.save();
            
            // Xóa userId khỏi mảng members của card
            card.members = card.members.filter(member => member.userId.toString() !== user.id);
            // Lưu thay đổi vào cơ sở dữ liệu cho card
            await card.save();
    
           res.redirect('back');
        } catch (error) {
            throw error;
        }
    } 
}

module.exports = new UserController;