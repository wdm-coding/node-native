const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const { userRegisterValidator,userEditValidator } = require('../validators/index');
router
.post('/register', userRegisterValidator,  userController.register) // 用户注册接口
.get('/list', userController.getUserList)// 查询用户列表
.post('/edit',userEditValidator, userController.editUser) // 编辑用户
.delete('/delete', userController.deleteUser) // 删除用户
.get('/:id', userController.getUserById) // 根据id查询用户信息

module.exports = router;