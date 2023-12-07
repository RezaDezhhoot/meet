const { DataTypes } = require('sequelize');

const sequelize = require('../../../../config/database');

const User = sequelize.define('User',{
    name:{
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    remember_token: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = User;