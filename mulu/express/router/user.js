const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const { userRegisterValidator,userEditValidator,userLoginValidator,updateProfileValidator } = require('../validators/index');
const { verifyToken } = require('../utils/jwt');

router
.post('/login', userLoginValidator, userController.login) // 用户登录接口
.post('/logout', verifyToken(), userController.logout) // 用户登出接口
.post('/register', userRegisterValidator,  userController.register) // 用户注册接口
.get('/list',verifyToken(), userController.getUserList)// 查询用户列表
.put('/edit',verifyToken(),userEditValidator, userController.editUser) // 编辑用户
.delete('/delete', verifyToken(),userController.deleteUser) // 删除用户
.get('/:id', verifyToken(),userController.getUserById) // 根据id查询用户信息
.put('/updateProfile', verifyToken(),updateProfileValidator, userController.updateProfile) // 修改个人信息
.post('/subscribe/:userId', verifyToken(), userController.subscribe) // 订阅用户
.post('/unsubscribe/:userId', verifyToken(), userController.unsubscribe) // 取消订阅用户
.get('/getChannel/:userId', verifyToken(false), userController.getChannel) // 获取订阅的用户
module.exports = router;