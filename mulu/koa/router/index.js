const Router = require('@koa/router');
const router = new Router({
    prefix: '/api'
})
const {verifyToken} = require('../utils/jwt')
const userController = require('../controller/user');
const userValidate = require("../middleware/userValdate")
// 定义根路径路由规则
router.get('/', async (ctx) => {
    ctx.body = 'Hello Koa!';
})

// 定义user路由规则
router
.post('/user/register',userValidate.registerValidate,userController.register) // 用户注册接口
.post('/user/login', userValidate.loginValidate, userController.login) // 用户登录接口
.get('/user/info',verifyToken(), userController.getUserInfo) // 获取用户信息接口
.get('/user/list',verifyToken(), userController.getUserList)// 查询用户列表
.put('/user/edit',verifyToken(),userValidate.editValidate, userController.editUser) // 编辑用户
.get('/user/getChannel/:userId',verifyToken(false),  userController.getChannel) // 获取关注用户的频道信息
.post('/user/subscribe/:subscribeUserId',verifyToken(), userController.subscribe) // 订阅用户
.post('/user/unsubscribe/:subscribeUserId',verifyToken(), userController.unsubscribe) // 取消订阅用户
// .delete('/user/delete',userController.deleteUser) // 删除用户
// .put('/user/updateProfile', updateProfileValidator, userController.updateProfile) // 修改个人信息
// .get('/user/getSubscribe/:userId', userController.getSubscribe) // 获取关注的用户列表
// .get('/user/getFans', userController.getFans) // 获取粉丝列表
// .post('/user/logout',  userController.logout) // 用户登出接口
// .get('/user/:id', userController.getUserById) // 根据id查询用户信息

// 定义
module.exports = router;