const koa = require('koa');
const app = new koa();
// 路由处理中间件
const Router = require('@koa/router');
const router = new Router({prefix: '/api/'}); // 创建路由中间件
// 定义路由规则
router.get('/', (ctx, next) => {
    ctx.body = '首页'; // 设置响应体
})
app.use(router.routes()) // 注册路由中间件
app.use(router.allowedMethods()) // 允许的请求方法
app.listen(3000, () => {
    console.log('服务启动成功 http://localhost:3000');
});