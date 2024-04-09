const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.render('home');
});

router.get('/signup', async (req, res) => {
    res.render('signup', {meta: 'Signup'});
});

module.exports = router;