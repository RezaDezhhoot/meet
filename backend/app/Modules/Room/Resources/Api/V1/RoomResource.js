const UserResource = require("../../../../User/Resources/Api/V1/UserResource");
const User = require("../../../../User/Models/User");
const helpers = require('../../../../../../utils/helpers')

exports.make =  async (room  , ignore = [] ) => {
    const host = await User.findByPk(room.host_id);
    ignore.forEach((v , k) => {
        room[v] = undefined;
    });

    return {
        id: room.id,
        title: room.title,
        capacity: room.capacity,
        key: room?.key,
        host: UserResource.make(host,null,['email','phone','status']),
        logo: helpers.asset(room?.logo),
        ui: room?.ui,
    }
}