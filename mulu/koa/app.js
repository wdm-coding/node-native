const koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const app = new koa();
// 全局错误处理中间件
app.use(async (ctx, next) => {
  try {
    // 可能出错的操作，例如调用外部 API
    const result = await next();
    ctx.body = result;
  } catch (error) {
    // 在这里处理错误，可以选择不继续向上抛出
    ctx.status = 400;
    ctx.body = { error: 'Failed to fetch data', details: error.message };
  }
});
// 解决跨域问题
app.use(cors());
// 解析请求体中间件
app.use(koaBody.default({
    multipart: true // form-data 解析
}));
// 路由处理中间件
const router = require('./router');
app.use(router.routes()) // 注册路由中间件
app.use(router.allowedMethods()) // 允许的请求方法
// 启动服务
app.listen(3000, () => {
    console.log('服务启动成功 http://localhost:3000');
});