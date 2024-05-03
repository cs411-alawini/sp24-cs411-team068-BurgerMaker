const dotEnv = require('dotenv').config();
if (!dotEnv) {
    console.log("Could not load .env file");
}

const express = require('express');
const app = express();

const helmet = require('helmet');
app.use(helmet());

const xssFilter = require('x-xss-protection')
app.use(xssFilter())

const cors = require('cors')
app.use(cors());

const jwt = require('jsonwebtoken');
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(req.headers)
    // console.log(token)

    if (token == null) return res.sendStatus(401); // 如果没有 token，则返回 401 未授权

    jwt.verify(token, "yunchao", (err, user) => {
        if (err) return res.sendStatus(403); // 如果 token 不正确或已过期，返回 403 禁止访问
        req.user = user.userId;
        next(); // token 正确，继续处理请求
    });
};

app.use('/api', authenticateToken);


// Static files
app.use('/static', express.static('static'));
app.use(express.json());

// View
var exphbs = require('express-handlebars');
app.engine('.html', exphbs({extname: '.html'}));
app.set('view engine', '.html');

// Test API
const testRouter = require('../controller/test');
app.use('/test', testRouter);

// Implement API
const loginRouter = require('../controller/login')
app.use('/login', loginRouter)
const apiRouter = require('../controller/api');
app.use('/api', apiRouter);

module.exports = app;
