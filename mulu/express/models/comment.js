const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const User = require('./user'); // 引入用户模型
const Comment = sequelize.define('Comment', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content:{
        type: DataTypes.STRING,
        allowNull: false, // 不能为空
    },
    userId:{ // 当前登录用户ID
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'User', // 引用 User 表
            key: 'id' // 外键字段名
        }
    },
    fileId:{ // 文件ID
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'File', // 引用 File 表
            key: 'id' // 外键字段名
        }
    }
}, {
    tableName: 'comment', // 指定表名
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});
Comment.belongsTo(User, { 
    foreignKey: 'userId',
    as:"commentUser" 
}); // 设置外键关系，表明 File 属于 User
module.exports = Comment;