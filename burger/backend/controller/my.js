const express = require('express');
const token = require('../middleware/token');

const router = express.Router();

// Token middleware
/*router.get('/', token, async (req, res) => {
    req.session.my = 1;
    res.sendStatus(200);
});
*/

router.get('/', async (req, res) => {
    req.session.my = 1;
    res.sendStatus(200);
});

router.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});

module.exports = router;