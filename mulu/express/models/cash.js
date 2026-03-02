const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const Cash = sequelize.define('Cash', {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tokenVersion:{
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'cash', // 指定表名
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});

module.exports = Cash;