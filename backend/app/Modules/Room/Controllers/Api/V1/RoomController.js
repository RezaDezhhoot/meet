const Room = require('../../../Models/Room');
const RoomResource = require('../../../Resources/Api/V1/RoomResource');

module.exports.exists = async (req , res) => {
    if (req.query.room) {
        const room_key = req.query.room;
        if (await Room.scope('open').findOne({where:{key: room_key}})) {
            return res.status(200).json({
                message: res.__("general.success")
            });
        }
    }
    return res.status(404).json({
        message: res.__("general.not_found")
    });
}

module.exports.show = async (req , res) => {
    if (req.params.room) {
        const room = await Room.scope('open').findOne({where:{key: req.params.room}});
        if (room) {
            const RoomData = await RoomResource.make(room ,[]);
            return res.status(200).json({
                room: RoomData,
                message: res.__("general.success")
            });
        }
    }
    return res.status(404).json({
        message: res.__("general.not_found")
    });
}