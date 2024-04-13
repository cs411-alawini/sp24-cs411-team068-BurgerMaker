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
const apiRouter = require('../controller/api');
app.use('/api', testRouter);

module.exports = app;
