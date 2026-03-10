const koa = require('koa');
const koaBody = require('koa-body');
const app = new koa();
app.use(koaBody.default({
    multipart: true // form-data 解析
}));
// 路由处理中间件
const router = require('./router/index');
app.use(router.routes()) // 注册路由中间件
app.use(router.allowedMethods()) // 允许的请求方法
app.on('error', (err, ctx) => {
    console.log('error---',err)
    ctx.body = err
})
app.listen(3000, () => {
    console.log('服务启动成功 http://localhost:3000');
});