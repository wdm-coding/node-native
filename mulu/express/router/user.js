const express = require('express');
const router = express.Router();
const userController = require('../controller/user');

router
.get('/list', userController.getUserList)// 查询用户列表
.post('/add', userController.addUser) // 添加用户
.post('/edit', userController.editUser) // 编辑用户
.delete('/delete', userController.deleteUser) // 删除用户
.get('/:id', userController.getUserById) // 根据id查询用户信息

module.exports = router;