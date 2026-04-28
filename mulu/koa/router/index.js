const Router = require('@koa/router');
const router = new Router({
    prefix: '/api'
})
const {verifyToken} = require('../utils/jwt')
const userController = require('../controller/user');
const uploadController = require('../controller/upload')
const fileController = require('../controller/file')
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
.get('/user/getSubscribes',verifyToken(),userController.getSubscribes) // 获取关注的用户列表

// 定义文件的路由规则
.post('/upload', verifyToken(),uploadController.uploadMidd.single('file'), uploadController.uploadFile) // 文件上传接口
.get('/file/list', verifyToken(), fileController.getList) // 文件列表接口
.post('/file/add', verifyToken(), fileController.addFile) // 新增文件接口
.get('/file/list/:userId', verifyToken(), fileController.getUserFileList) // 获取用户文件列表
.post('/file/comment',verifyToken(), fileController.addComment) //添加评论信息
module.exports = router;