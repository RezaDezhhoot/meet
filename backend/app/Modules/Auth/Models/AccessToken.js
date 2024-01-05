const { DataTypes } = require('sequelize');

const sequelize = require('../../../../config/database');

const AccessToken = sequelize.define('AccessToken',{
    name :{
        type: DataTypes.STRING,
        allowNull: true
    },
    value: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    expire_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
},{
    tableName: 'access_tokens',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = AccessToken;