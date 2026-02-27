const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const md5 = require('../utils/md5'); // 引入 md5 加密函数
const User = sequelize.define('User', {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
        // 在保存用户之前对密码进行加密
        set(val) {
            this.setDataValue('password', md5(val));
        }
    },
    age:{
        type: DataTypes.INTEGER,
        allowNull: true,
        validate:{
            min: 0,
            max: 200
        }
    }
    // Sequelize 会默认添加 id, createdAt, updatedAt 字段
}, {
    tableName: 'user', // 指定表名
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});

module.exports = User;