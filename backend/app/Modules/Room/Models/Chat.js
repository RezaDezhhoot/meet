const User = require('../../User/Models/User');
const sequelize = require('../../../../config/database');
const {DataTypes} = require("sequelize");
const Room = require('../Models/Room');

const Chat = sequelize.define('Chat',{
    text:{
        type: DataTypes.TEXT,
    },
    sender:{
        type: DataTypes.STRING,
    },
    user_ip:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.BIGINT,
        unsigned: true,
        allowNull: true,
    },
    room_id: {
        unsigned: true,
        type: DataTypes.BIGINT,
    }
},{
    tableName: 'chats',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});


module.exports = Chat;