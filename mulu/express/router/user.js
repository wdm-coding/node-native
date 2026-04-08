const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const { userRegisterValidator,userEditValidator,userLoginValidator,updateProfileValidator } = require('../validators/index');
const { verifyToken } = require('../utils/jwt');
const multer = require('multer'); // 引入 multer
const uploadMidd = multer({
  dest: 'uploads/' // 设置上传文件的存储目录
})

router
.post('/login', userLoginValidator, userController.login) // 用户登录接口
.post('/parseCert',verifyToken(),uploadMidd.single('file'), userController.parseCert) // 证书上传后解析证书信息接口
.get('/info', verifyToken(), userController.getUserInfo) // 获取用户信息接口
.post('/logout', verifyToken(), userController.logout) // 用户登出接口
.post('/register', userRegisterValidator,  userController.register) // 用户注册接口
.get('/list',verifyToken(), userController.getUserList)// 查询用户列表
.put('/edit',verifyToken(),userEditValidator, userController.editUser) // 编辑用户
.delete('/delete', verifyToken(),userController.deleteUser) // 删除用户
.put('/updateProfile', verifyToken(),updateProfileValidator, userController.updateProfile) // 修改个人信息
.post('/subscribe/:userId', verifyToken(), userController.subscribe) // 订阅用户
.post('/unsubscribe/:userId', verifyToken(), userController.unsubscribe) // 取消订阅用户
.get('/getChannel/:userId', verifyToken(false), userController.getChannel) // 获取关注用户的频道信息
.get('/getSubscribes',verifyToken(),userController.getSubscribes) // 获取关注的用户列表
.get('/getFans',verifyToken(), userController.getFans) // 获取粉丝列表
.get('/:id', verifyToken(),userController.getUserById) // 根据id查询用户信息
module.exports = router;