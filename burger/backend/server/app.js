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

// Session
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisClient = redis.createClient();

var sess = {
    secret: '3AJ9IzEw56GOY4FeeKIr3tA4FTkpYkSf16',
    store: new RedisStore({ client: redisClient }),
    cookie: {maxAge: 60000},
    saveUninitialized: false,
    resave: false
};

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));

// Static files
app.use('/static', express.static('static'));
app.use(express.json());

// View
var exphbs = require('express-handlebars');
app.engine('.html', exphbs({extname: '.html'}));
app.set('view engine', '.html');

// Guest
const guestRouter = require('../controller/guest');
app.use('/', guestRouter);

// Logged in user
const myRouter = require('../controller/my');
app.use('/my', myRouter);

module.exports = app;
