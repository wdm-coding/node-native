const koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const db = require('./models'); // 引入模型入口，触发数据库连接和同步
const app = new koa();
// 全局错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    // 在这里处理错误，可以选择不继续向上抛出
    ctx.status = 500;
    ctx.body = { 
      code:1,
      msg:error.message,
      data:null
    };
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
// 在启动服务器前先同步数据库
db.sync().then(() => {
    console.log('模型同步成功，准备启动服务器...');
    // 启动服务器
    app.listen(3000, () => {
      console.log('服务启动成功 http://localhost:3000');
    });
}).catch((err) => {
    console.error('数据库同步失败:', err);
});