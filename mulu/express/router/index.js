const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controller/upload');
const { verifyToken } = require('../utils/jwt');
const multer = require('multer'); // 引入 multer
const uploadMidd = multer({
  dest: 'uploads/' // 设置上传文件的存储目录
})
// index
router.get('/', async (req, res) => {
  res.send('Hello, Express!');
});

// upload
router.post('/upload',verifyToken(),uploadMidd.single('file'), uploadFile);

// user
router.use('/user', require('./user'))

// file
router.use('/file', require('./file'))

module.exports = router;