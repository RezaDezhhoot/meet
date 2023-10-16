const Chat = require('../../../Models/Chat');
const ChatResource = require('../../../Resources/Api/V1/ChatResoource');

module.exports.index = async (req , res) => {
    const room = req.room;
    const chats = await Chat.findAll({where:{room_id: room.id},order:[['id','DESC']],limit:30})

    return res.status(200).json({
        data:{
            chats: ChatResource.collection(chats),
            message: res.__("general.success")
        }
    });
}