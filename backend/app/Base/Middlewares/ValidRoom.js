const Room = require("../../Modules/Room/Models/Room");

module.exports = async (req, res, next) => {
    if (req.query.room) {
        const room_key = req.query.room;
        let room = await Room.scope('open').findOne({where:{key: room_key}});
        if (room) {
            req.room = room;
            return next();
        }
    }
    return res.status(400).json({});
}