const express = require('express');
const db = require('./models'); // 引入模型入口，触发数据库连接和同步
const Router = require('./router/index'); // 引入路由聚合
const app = express();
const cors = require('cors'); // 引入跨域中间件
const morgan = require('morgan'); // 引入日志记录中间件

// app.use应用程序中间件
app.use((req,res,next)=>{next()})

// 中间件：解析application/x-www-form-urlencoded格式的请求体
app.use(express.urlencoded({ extended: true })); // extended: true 解析复杂对象
// 中间件：解析JSON格式的请求体
app.use(express.json());

// 跨域中间件cors
app.use(cors());

// 日志记录中间件morgan
app.use(morgan('dev'));

// 路由中间件
app.use('/api',Router)

// 处理404错误中间件
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// 处理500错误中间件
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server Error');
});

// 在启动服务器前先同步数据库
db.sync().then(() => {
    console.log('模型同步成功，准备启动服务器...');
    // 启动服务器
    app.listen(3000, () => {
      console.log('服务启动成功，端口 3000 http://localhost:3000');
    });
}).catch((err) => {
    console.error('数据库同步失败:', err);
});