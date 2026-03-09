const redisClient = require('../config/redis');
// 文件热度 查看文件+1，点赞+2，评论+2，收藏+3
async function hotInc(fileId,incNum){
    const data = await redisClient.zscore('fileHots', fileId); // 获取当前热度值
    let newhots = 0
    if (data) { // 如果热度值存在
        newhots = await redisClient.zincrby('fileHots', incNum, fileId); // 更新热度值
    }else{
        newhots = await redisClient.zadd('fileHots', incNum, fileId); // 如果热度值不存在，则初始化热度值为1
    }
    return newhots

}

// 获取热度排行榜
async function topHots(limit = 10) {
    const hots = await redisClient.zrevrange('fileHots', 0, limit - 1, 'WITHSCORES'); // 获取热度排行榜
    let result = {}
    for (let i = 0; i < hots.length; i += 2) { // 每两个元素一组，第一个是文件ID，第二个是热度值
        result[hots[i]] = hots[i + 1]; // 将文件ID和热度值存储到结果对象中
    }
    return result;
}

// 获取单个文件的热度值
async function getHot(fileId) {
    const data = await redisClient.zscore('fileHots', fileId); // 获取单个文件的热度值
    return data;
}


module.exports = {hotInc,topHots,getHot};