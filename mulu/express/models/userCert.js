// 用户证书模型
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 引入数据库实例
const User = require('./user'); // 引入用户模型
const UserCert = sequelize.define('userCert', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: '主键ID'
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: '用户ID',
        unique: true,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    certPem: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '用户证书'
    },
    encryptedPrivateKey: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '加密后的用户私钥'
    }
}, {
    tableName: 'user_cert',
    timestamps: true, // 使用时间戳字段，默认为 true
    underscored: true, // 使用下划线命名字段
});
User.hasOne(UserCert, { foreignKey: 'userId', as: 'cert' });
UserCert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// 导出模型
module.exports = UserCert;
