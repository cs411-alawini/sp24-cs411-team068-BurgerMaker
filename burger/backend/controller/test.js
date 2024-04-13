const express = require('express');
const router = express.Router();

router.get('/simple', async (req, res) => {
    res.json({ message: 'Data received', yourData: req.body });
});



module.exports = router;