const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('wdm_db', 'wdm_db', 'Wdm199496', {
    host: 'rm-2ze84214zfe5t4ra3no.mysql.rds.aliyuncs.com',
    dialect: 'mysql',
    logging: console.log // 开发时可以打印 SQL 语句，生产环境应设为 false
});

module.exports = sequelize;