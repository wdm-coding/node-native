const express = require('express');
const router = express.Router();

// index
router.get('/', async (req, res) => {
  res.send('Hello, Express!');
});

// user
router.use('/user', require('./user'))
// video
router.use('/video', require('./video'))

module.exports = router;