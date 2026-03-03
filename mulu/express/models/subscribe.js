const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const Subscribe = sequelize.define('Subscribe', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'User', // 引用 User 表
            key: 'id' // 引用的字段名
        },
    },
    subscribeUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'User', // 引用 User 表
            key: 'id' // 引用的字段名
        },
    }
}, {
    tableName: 'subscribe', // 指定表名
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});

module.exports = Subscribe;