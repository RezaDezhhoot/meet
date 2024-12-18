const { DataTypes } = require('sequelize');
const User = require('../../User/Models/User');
const sequelize = require('../../../../config/database');
const {OPEN} = require("../Enums/status");

const Room = sequelize.define('Room',{
    title:{
        type: DataTypes.STRING,
        allowNull: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    capacity: {
        type: DataTypes.BIGINT,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    host_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    owner_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    logo:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    ui:{
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
},{
    tableName: 'rooms',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    scopes: {
        open:{
            where: {
                status: OPEN
            }
        },
    }
});



module.exports = Room;