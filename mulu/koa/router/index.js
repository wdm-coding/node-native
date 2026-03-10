const Router = require('@koa/router');
const router = new Router({prefix: '/api'}); // 创建路由中间件
// 定义路由规则
router.get('/', ctx => {
    ctx.body = '首页';
})
router.get('/user', ctx => {
    ctx.body = '用户';
})

module.exports = router;