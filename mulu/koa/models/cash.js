const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const Cash = sequelize.define('Cash', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // 自动生成 UUID v4
        primaryKey: true
    },
    tokenVersion:{
        type: DataTypes.STRING,
        allowNull: false
    },
    userId:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'User', // 引用 User 表
            key: 'id' // 外键字段名
        }
    }
}, {
    tableName: 'cash', // 指定表名
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});

module.exports = Cash;