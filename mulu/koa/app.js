const koa = require('koa');
const app = new koa();
// 路由处理中间件
const router = require('./router/index');
app.use(router.routes()) // 注册路由中间件
app.use(router.allowedMethods()) // 允许的请求方法
app.listen(3000, () => {
    console.log('服务启动成功 http://localhost:3000');
});