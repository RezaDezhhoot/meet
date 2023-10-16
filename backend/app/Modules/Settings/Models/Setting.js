const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/database');

const Setting = sequelize.define('Room',{
    name:{
        type: DataTypes.STRING,
    },
    value: {
        type: DataTypes.TEXT,
    },
},{
    tableName: 'settings',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Setting;