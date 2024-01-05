const { DataTypes } = require('sequelize');

const sequelize = require('../../../../config/database');

const OAuth = sequelize.define('OAuth',{
    token :{
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    room_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    expire_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
},{
    tableName: 'o_auths',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = OAuth;