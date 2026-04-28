const koa = require('koa');
const app = new koa();
app
.use(async (ctx,next) => {
    console.log('中间件1执行了1') // 1. 先执行中间件1的第一个函数
    next(); // 2. next() 执行下一个中间件，也就是中间件2的第一个函数
    console.log('中间件1执行了2') // 4. 新的事件循环开始执行，也就是中间件1的第二个函数
})
.use(async (ctx,next) => {
    await console.log('中间件2执行了1') // 3. 执行中间件2的第一个函数，但是因为 await 所以之后的函数会变为微任务，放在下一次事件循环中执行，同时此次调用栈已结束，所以会执行下一个事件，也就是中间件1的第二个函数，也就是 console.log('中间件1执行了2')
    next(); // 5. 执行微任务中的 next()，也就是中间件2的第二个函数，之后执行下一个中间件，也就是中间件3的第一个函数
    console.log('中间件2执行了2') // 9. 执行完中间件2的第二个函数，也就是 console.log('中间件2执行了2')
})
.use(async (ctx,next) => {
    console.log('中间件3执行了1') // 6. 先执行中间件3的第一个函数
    next(); // 7. 开始往回执行，也就是此中间件的第二个函数
    console.log('中间件3执行了2') // 8. 执行完中间件3的第二个函数
})
.listen(3000, () => {
    console.log('服务启动成功 http://localhost:3000');
});