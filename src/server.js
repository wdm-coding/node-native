// 1. 引入http模块
const http = require('http');

// 2. 创建服务器
const server = http.createServer();

// 3. 启动服务器
server.listen(3000, () => {
    const url = `http://localhost:3000`;
    console.log('服务已启动，监听端口：3000',url);
});
// 4. 监听请求事件
const fs = require('fs');
server.on('request', (req, res)=>{
    console.log('收到请求-url', req.url);
    console.log('收到请求-方式', req.method);
    if(req.url === '/'){
        fs.readFile('./src/index.html','utf-8', (err, data)=>{
            if(err)  {
                res.end('文件读取失败')
                throw err
            }
            res.end(data);
        });
    }else if(req.url.includes('.png')){
        fs.readFile(`./src${req.url}`, (err, data)=>{
            if(err)  {
                res.end('文件读取失败')
                throw err
            }
            res.setHeader('Content-Type', 'image/png'); // 设置响应头，告诉浏览器返回的内容类型是图片
            res.end(data);
        })
    }else{
        res.statusCode = 404; // 设置状态码为404
        res.end('<h1>404</h1>');
    }
});