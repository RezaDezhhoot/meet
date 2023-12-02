const { DataTypes } = require('sequelize');

const sequelize = require('../../../../config/database');

const Token = sequelize.define('token',{
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false
    },
    value: {
        type: DataTypes.INTEGER,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
},{
    tableName: 'tokens',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Token;