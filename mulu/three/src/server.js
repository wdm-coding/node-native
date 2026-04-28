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
const url = require('url');
server.on('request', (req, res)=>{
    console.log('收到请求-url', req.url);
    console.log('收到请求-方式', req.method);
    const {pathname,query} = url.parse(req.url,true);
    console.log('pathname',pathname);
    if(req.method === 'GET'){
        switch (pathname) {
            case '/':
                fs.readFile('./src/index.html','utf-8', (err, data)=>{
                    if(err)  {
                        res.end('文件读取失败')
                        throw err
                    }
                    res.end(data);
                });
                break;
            case '/getUser':
                console.log('query',query);
                res.end('getUser');
                break;
            default:
                if(pathname.includes('.png')){
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
                break;
        }
    }else if(req.method === 'POST'){
        switch (pathname) {
            case '/setUser':
                // body
                let data = '';
                req.on('data', (chunk)=>{
                    data += chunk;
                })
                req.on('end', ()=>{
                    // const obj = require('querystring').parse(data);
                    const obj = JSON.parse(data);
                    console.log('obj',obj);
                    res.end('setUser');
                })
                break;
            default:
                res.statusCode = 404; // 设置状态码为404
                res.end('<h1>404</h1>');
                break;
        }
    }else{
        res.statusCode = 404; // 设置状态码为404
        res.end('<h1>404</h1>');
    }
});