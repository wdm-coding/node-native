const express = require('express');
const app = express();
const indexRouter = require('./router/index');
const usersRouter = require('./router/user');
function logs(req){
  console.log(`${req.method}-${req.url}-${new Date().toLocaleString()}`);
}
// app.use应用程序中间件
app.use((req,res,next)=>{
  logs(req);
  next();
})
// 中间件：解析application/x-www-form-urlencoded格式的请求体
app.use(express.urlencoded({ extended: true })); // extended: true 解析复杂对象
// 中间件：解析JSON格式的请求体
app.use(express.json());
// 路由中间件
app.all('/all', (req, res, next) => {
  console.log('all');
  next();
})
app.use('/',indexRouter)
app.use('/user',usersRouter)
// 路由的链式调用
app.get('/', (req, res) => {
  res.send('Hello World!');
}).post('/', (req, res) => {
  res.send('Hello Post!');
})
// 处理404错误中间件
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});
// 处理500错误中间件
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server Error');
});
app.listen(3000, () => {
  console.log('Server is running on port 3000 http://localhost:3000');
});