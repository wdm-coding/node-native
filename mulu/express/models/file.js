const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const File = sequelize.define('File', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // 自动生成 UUID v4
        primaryKey: true
    },
    filename: {
        type: DataTypes.STRING,
        unique: true, // 文件名必须是唯一的，不允许重复
        allowNull: false, // 必须不为空
    },
    size:{ // 文件大小字段
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    originalname:{ // 原始文件名字段
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'null'
    },
    description:{ // 文件描述字段
        type: DataTypes.STRING,
        allowNull: true, // 允许为空，默认为 null
        defaultValue: 'null'
    },
    commentCount:{ // 评论数量字段
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    userId:{ // 这里的 userId 是外键，用于关联 User 表中的用户记录
        type: DataTypes.UUID,
        allowNull: false, // 每个文件必须关联一个用户
        references: {
          model: 'User', // 关联的用户模型名，对应 User 表
          key: 'id' // 用户表的主键字段名
        },
        onDelete: 'CASCADE' // 当用户被删除时，相关文件也会被删除，即级联删除
    }
    // Sequelize 会默认添加 id, createdAt, updatedAt 字段
}, {
    tableName: 'file', // 指定表名
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});
module.exports = File;