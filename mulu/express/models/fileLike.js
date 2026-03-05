const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const File = require('./file'); // 引入 File 模型

const FileLike = sequelize.define('FileLike', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // 自动生成 UUID v4
        primaryKey: true
    },
    userId:{ // 这里的 userId 是外键，用于关联 User 表中的用户记录
        type: DataTypes.UUID,
        allowNull: false, // 每个点赞记录必须关联一个用户
        references: {
            model: 'User', // 关联的用户模型名，对应 User 表
            key: 'id' // 用户表的主键字段名
        },
    },
    fileId:{ // 这里的 fileId 是外键，用于关联 File 表中的文件记录
        type: DataTypes.UUID,
        allowNull: false, // 每个点赞记录必须关联一个文件
        references: {
            model: 'File', // 关联的文件模型名，
            key: 'id' // 文件表的主键字段名
        }
    },
    like:{ // 点赞字段
        type: DataTypes.INTEGER,
        allowNull: false, // 点赞字段不允许为空
        enum: [-1, 1], // 点赞字段只能是 -1 或 1，其中 1 表示点赞
        defaultValue: 1 // 点赞字段默认为 1，表示点赞
    }
}, {
    tableName: 'fileLike', // 指定表名
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});
FileLike.belongsTo(File, { foreignKey: 'fileId', as:'fileInfo' }); // 设置外键关系，表明 FileLike 表通过 fileId 字段关联 File 表，并通过 as:'fileInfo' 设置别名。

module.exports = FileLike;