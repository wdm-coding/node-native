const express = require('express');
const router = express.Router();

router.get('/list', (req, res) => {
  res.send('视频列表')
})


module.exports = router;