const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const render = require('../configs/render');

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
                fullname: req.body.fullname,
                email: req.body.email,
                password : hashedPassword
            });

            res.redirect('login');
        } catch (error) {
            console.error('Error during user creation:', error);
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
            console.error('Error during login:', error);
            res.status(500).send('Internal Server Error');
        }
    };

    logOut = async (req, res, next) => {
        res.clearCookie('token');
        res.redirect('/');
    }

}

module.exports = new UserController;