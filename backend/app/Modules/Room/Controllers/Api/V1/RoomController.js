const Room = require('../../../Models/Room');

module.exports.exists = async (req , res) => {
    if (req.query.room) {
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