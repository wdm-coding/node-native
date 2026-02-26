// 统一导出所有模型，并处理数据库同步
const sequelize = require('../config/database');
const User = require('./user');
// 将模型挂载到 sequelize 实例上，方便后续调用
const db = {};
db.User = User;
db.sequelize = sequelize;
// 同步数据库表结构
db.sync = async () => {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功!');
        // await sequelize.sync({ alter: true }); // 开发时使用 alter，生产环境应使用 Migrations
        console.log('数据库同步成功!');
    } catch (error) {
        console.error('数据库同步失败:', error);
        process.exit(1); // 同步失败时退出进程
    }
};

module.exports = db;