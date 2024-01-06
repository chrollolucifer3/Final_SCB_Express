const express = require('express');
const app = express();
const port = 3000;

const cookieParser = require('cookie-parser');
const verifyToken = require('./middlewares/verifyToken');

app.use(cookieParser());
app.use(verifyToken);

// Kết nối với mongoDB
const db = require('./configs/index');
db.connect();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// sử dụng pug
app.set('view engine', 'pug');
app.set('views', './src/views');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const route = require('./routes');
route(app);


app.listen(port, () => {
    console.log(`Running at port: ${port}`);
})

