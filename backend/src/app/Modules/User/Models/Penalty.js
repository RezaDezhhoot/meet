const User = require('../../User/Models/User');
const sequelize = require('../../../../config/database');
const {DataTypes} = require("sequelize");

const Penalty = sequelize.define('Penalty',{
    kicked_at:{
        type: DataTypes.DATE,
        allowNull: true,
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
    tableName: 'penalties',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});


module.exports = Penalty;