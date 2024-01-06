const boardRouter = require('./boardRoutes');
const listRouter = require('./listRoutes');
const siteRouter = require('./siteRoutes');
const userRouter = require('./userRoutes');
const cardRouter = require('./cardRoutes');

function route(app) {
    
    app.use('/board', boardRouter);
    app.use('/', listRouter);
    app.use('/', siteRouter);
    app.use('/', userRouter);
    app.use('/', cardRouter);

}

module.exports = route