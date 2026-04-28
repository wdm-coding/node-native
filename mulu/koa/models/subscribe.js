const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const User = require('./user'); // 引入用户模型
const Subscribe = sequelize.define('Subscribe', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId:{ // 订阅的用户id
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'User', // 引用 User 表
            key: 'id' // 引用的字段名
        },
        onDelete: 'CASCADE' // 当被引用的用户删除时，订阅记录也会被级联删除
    },
    subscribeUserId: { // 被订阅的用户id
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'User', // 引用 User 表
            key: 'id' // 引用的字段名
        },
        onDelete: 'CASCADE' // 当被引用的用户删除时，订阅记录也会被级联删除
    }
}, {
    tableName: 'subscribe', // 指定表名
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});
// 定义关联关系
// 一个订阅记录属于一个被订阅的用户
Subscribe.belongsTo(User, { 
  foreignKey: 'subscribeUserId', 
  as: "subscribed" // 重命名这个别名，使其更清晰
});
// 一个订阅记录属于一个订阅的用户
Subscribe.belongsTo(User, { 
  foreignKey: 'userId', 
  as: "fans" // 重命名这个别名，使其更清晰
});
module.exports = Subscribe;