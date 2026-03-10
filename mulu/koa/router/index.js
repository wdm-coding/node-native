const Router = require('@koa/router');
const router = new Router({
    prefix: '/api'
})
// 定义路由规则
router.get('/', ctx => {
    ctx.body = '首页';
})
module.exports = router;