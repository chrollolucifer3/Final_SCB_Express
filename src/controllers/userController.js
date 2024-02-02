const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const render = require('../configs/render');
const Card = require('../models/card');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

    getForgot = async (req, res, next) => {
        render(req, res, 'forgot-pass')
    }

    forgotPass = async (req, res, next) => {
        try {
            const email = req.body.email;
            const user = await User.findOne({ email });
    
            if (!user) {
                return render(req, res, 'forgot-pass', { errMessage: 'Không tìm thấy email' });
            }
    
            // Tạo mã ngẫu nhiên cho việc đặt lại mật khẩu
            const resetToken = crypto.randomBytes(20).toString('hex');
            // Lưu mã ngẫu nhiên và thời gian hết hạn vào cơ sở dữ liệu
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // Hết hạn sau 1 giờ
            await user.save();
    
            // Gửi email với liên kết đặt lại mật khẩu
            const resetLink = `http://${req.headers.host}/reset-password/${resetToken}`;
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD 
                }
            });
            await transporter.sendMail({
                to: user.email,
                subject: 'Password Reset',
                html: `Click <a href="${resetLink}">here</a> to reset your password.`
            });
    
            render(req, res, 'check-email');
        } catch (error) {
            throw error;
        }
    }

    getReset = async (req, res, next) => {
        try {
            const token = req.params.token;
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: {$gt: Date.now()}
            });

            if(!user) {
                return render(req, res,'reset-pass',{token, message: 'Invalid or expired reset token' });
            }

            render(req, res, 'reset-pass', {token});
        } catch (error) {
            throw error;
        }
    }

    resetPass = async (req, res, next) => {
        try {
            const token = req.params.token;
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: {$gt: Date.now()}
            });

            if(!user) {
                return render(req, res,'reset-pass',{token, message: 'Invalid or expired reset token' });
            }

            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
        
            // Cập nhật mật khẩu mới và xóa thông tin đặt lại mật khẩu trong cơ sở dữ liệu
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
        
            render(req, res, 'login');

        } catch (error) {
            console.error('Error during password change:', error);
            return next(error);
        }
    }
}

module.exports = new UserController;