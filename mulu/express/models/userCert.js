const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const User = require('./user'); // 引入用户模型实例

const UserCert = sequelize.define('UserCert', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '关联的用户ID',
        references: {
            model: 'User',
            key: 'id'
        }
    },
    // 用户证书私钥
    privateKey: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // 用户证书
    clientCert: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // 用户证书p12格式buffer
    p12: {
        type: DataTypes.BLOB,
        allowNull: false
    }
}, {
    tableName: 'userCert',
    timestamps: true, // 自动创建 createdAt 和 updatedAt 字段
    underscored: true // 使用下划线命名 (created_at)
});

User.hasOne(UserCert, { foreignKey: 'userId', as: 'cert' });
UserCert.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = UserCert;