const jwt = require("jsonwebtoken");
const {GUEST, LOGIN} = require("../../../Auth/Enums/LoginTypes");
const User = require('../../../User/Models/User');
const Penalty = require('../../../User/Models/Penalty');
const Chat = require('../../Models/Chat');
let users = {};
let typistUsers = {};
let host = null;
let host_socket_id = null;
let shared_camera = false;

const UserResource = require('../../../User/Resources/Api/V1/UserResource');
const MediaResource = require('../../Resources/Api/V1/MediaResource');
const RoomResource = require('../../Resources/Api/V1/RoomResource');
const ChatResoource = require('../../Resources/Api/V1/ChatResoource');

module.exports.sendRoom = async (io,socket,data,room) => {
    io.emit('get-room',{
        data:{
            room:await RoomResource.make(room),
        },
        status: 200
    });
}

module.exports.join = async (io,socket,data,room) => {
    let status = 404;

    if (room.capacity === Object.entries(users).length) {
        socket.emit('error',{
            data:{
                code: 422
            }
        });
        return;
    }

    await this.sendRoom(io,socket,data,room);
    switch (data.type) {
        case LOGIN:
            const token = data.token;
            const decoded_token = jwt.verify(token,process.env.JWT_SECRET);
            if (decoded_token && decoded_token.user) {
                const user = await User.findByPk(decoded_token.user._id);
                if (user) {
                    status = 200;
                    users[socket.id] = {
                        socketId: socket.id,
                        name: user.name,
                        ip: socket.handshake.address,
                        user: UserResource.make(user,null,['email','phone','status']),
                        media: MediaResource.make(user,room,data.type),
                    };

                    if (user.id === room.host_id) {
                        host = users[socket.id];
                        host_socket_id = socket.id;
                    }

                    if (host) {
                        io.emit('host-joined',{
                            data:{
                                host
                            },status
                        });
                    }
                }
            }
            break;
        case GUEST:
            status = 200;
            break;
        default:
            return;
    }

    io.emit('get-users',{
        data:{
            users
        },
        status
    });
    io.emit('create-pc',{
        data:{shared_camera,host_id: room.host_id},
        status
    });
}

module.exports.newMessage = async (io,socket,data,room) => {
    let status = 201;
    let message;
    try {
        if (data.message && data.message.length > 0 && data.message.length <= 100 && typeof data.message === 'string') {
            const user = users[socket.id];
            message = await Chat.create({
                text: data.message,
                room_id: room.id,
                sender: user.name,
                user_id: user?.user?.id,
                user_ip: socket.handshake.address,
            });
        } else {
            status = 422;
        }
    } catch (err) {
        status = 500;
    }
    io.emit('get-new-message',{
        data:{
            message: ChatResoource.make(message)
        },status
    })
}

module.exports.typing = async (io,socket,data,room) => {
    typistUsers[socket.id] = {
        name: data.name,
        socketId : socket.id
    };
    socket.broadcast.emit('get-typists',{
        data:{
            typistUsers
        }, status:200
    });
}

module.exports.noTyping = async (io,socket,data,room) => {
    delete typistUsers[socket.id];
    socket.broadcast.emit('get-typists',{
        data:{
            typistUsers
        }, status:200
    });
}

module.exports.shareStream = async (io,socket,data,room) => {
    if ( (socket.id === host_socket_id && data.media === 'camera') || data.media === 'audio') {
        if (data.media === 'camara' && ! users[socket.id].media.media.remote.camera) {
            return;
        }

        if (data.media === 'audio' && ! users[socket.id].media.media.remote.microphone) {
            return;
        }

        users[socket.id].media.settings[data.media] = true;

        socket.to(data.to).emit("get-offer",{
            data: {
                offer: data.offer,
                from: socket.id,
                media: data.media,
                streamID: data.streamID
            } , status: 200
        })
    }
}

module.exports.makeAnswer = async (io,socket,data,room) => {
    if (data.media === 'camera') {
        shared_camera = true;
    }
    socket.to(data.to).emit('answer-made',{
        data:{
            answer: data.answer,
            from: socket.id,
            media: data.media
        } , status: 200
    });
}

module.exports.endStream = async (io,socket,data,room) => {
    if (data.media === 'camera') {
        if (users[socket.id] === host && shared_camera) {
            shared_camera = false;
        }
    }
    users[socket.id].media.settings[data.media] = false;
    io.emit('end-stream',{
        data: {
            media: data.media,
            streamID: data.streamID,
            from: socket.id
        }
    });
}

module.exports.getShared = async (io,socket,data,room) => {
    socket.to(data.to).emit('send-shared',{
        data:{
            from: data.from,
            media: data.media
        }, status: 200
    });
}

module.exports.controlRemoteMedia = async (io,socket,data,room) => {
    if (host && socket.id === host_socket_id) {
        const user = users[data.to];
        users[data.to].media.media.remote[data.device] = !user.media.media.remote[data.device];

        io.emit('get-users',{
            data:{
                users
            },
            status: 200
        });
    }
}

module.exports.controlLocalMedia = async (io,socket,data,room) => {
    const user = users[socket.id];
    let status;
    if (data.hasOwnProperty('action')) {
        status = data.action;
    } else {
        status = ! user.media.media.local[data.device];
    }

    if (user) {
        users[socket.id].media.media.local[data.device] = status;

        io.emit('get-users',{
            data:{
                users
            },
            status: 200
        });
    }
}


module.exports.shareScreen = async (io,socket,data,room) => {

}

module.exports.handRising = async (io,socket,data,room) => {
    if (socket.id === host_socket_id || data.to === socket.id) {
        const user = users[data.to];
        users[data.to].media.settings.hand_rising = ! user.media.settings.hand_rising;

        if (socket.id !== host_socket_id && host) {
            socket.to(host_socket_id).emit('client-risen-hand',{
                data:{
                    sender: user.name,
                    status: users[data.to].media.settings.hand_rising
                }
            });
        }

        io.emit('get-users',{
            data:{
                users
            },
            status: 200
        });

    }

}

module.exports.promotion = async (io,socket,data,room) => {

}

module.exports.demote = async (io,socket,data,room) => {

}




module.exports.disconnect = async (io,socket,data,room) => {

    if (users[socket.id] === host) {
        host= null;
        if (shared_camera) {
            shared_camera = false;
            io.emit('end-shared-camera');
        }
        host_socket_id = null;
        io.emit('host-joined',{
            data:{
                host: null
            },status: 200
        });
    }
    delete users[socket.id];
    delete typistUsers[socket.id];
    io.emit('get-users',{
        data:{
            users
        },
        status: 200
    });
}

module.exports.kickClient = async (io,socket,data,room) => {
    if (host && socket.id === host_socket_id && host_socket_id !== data.to) {
        const user = users[data.to];

        await Penalty.create({
            kicked_at: Date.now() + 2 * 60 * 60 * 1000 ,
            room_id: room.id,
            user_id: user?.user?.id,
            user_ip: user.ip,
        });

        delete users[data.to];
        delete typistUsers[data.to];


        socket.to(data.to).emit('error',{
            data:{
                code: 403
            }
        });

        io.emit('get-users',{
            data:{
                users
            },
            status: 200
        });
    }
}
