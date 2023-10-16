const UserResource = require("../../../../User/Resources/Api/V1/UserResource");
exports.make =  async (room  , ignore = [] ) => {
    const host = await room.getUser();
    ignore.forEach((v , k) => {
        user[v] = undefined;
    });

    return {
        id: room?.id,
        title: room?.title,
        capacity: room?.capacity,
        key: room?.key,
        host: UserResource.make(host,null,['email','phone','status'])
    };
}