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
        references: {
            model: User,
            key: 'id',
        },
        allowNull: true,
    }
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

Room.belongsTo(User,{
    foreignKey: 'host_id'
});

module.exports = Room;