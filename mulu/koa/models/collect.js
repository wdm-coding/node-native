const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const Collect = sequelize.define('Collect', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId:{
        type: DataTypes.UUID,
        allowNull: false, // 允许为空，默认为 null
        references: { // 引用其他表
            model: 'User', // 引用 User 表
            key: 'id' // 引用 User 表中的 id 字段
        }
    },
    fileId:{
        type: DataTypes.UUID,
        allowNull: false, // 允许为空，默认为 null
        references: { // 引用其他表
            model: 'File', // 引用 File 表
            key: 'id' // 引用 File 表中的 id 字段
        }
    }
}, {
    tableName: 'collect', // 指定表名
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});

module.exports = Collect;