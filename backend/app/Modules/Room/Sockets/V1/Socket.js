const jwt = require("jsonwebtoken");
const {GUEST, LOGIN} = require("../../../Auth/Enums/LoginTypes");
const User = require('../../../User/Models/User');
const Penalty = require('../../../User/Models/Penalty');
const Chat = require('../../Models/Chat');
let users = {};
let typistUsers = {};
let host = {};
let host_socket_id = {};

const UserResource = require('../../../User/Resources/Api/V1/UserResource');
const MediaResource = require('../../Resources/Api/V1/MediaResource');
const RoomResource = require('../../Resources/Api/V1/RoomResource');
const ChatResoource = require('../../Resources/Api/V1/ChatResoource');

module.exports.createRoom = async (io , socket , room) => {
    if (! users[room.key]) {
        users[room.key] = {};
    }

    if (! typistUsers[room.key]) {
        typistUsers[room.key] = {};
    }

    if (! host[room.key]) {
        host[room.key] = {};
    }
}

module.exports.sendRoom = async (io,socket,data,room) => {
    socket.emit('get-room',{
        data:{
            room: await RoomResource.make(room),
        },
        status: 200
    });
}

module.exports.join = async (io,socket,data,room) => {
    let status = 404;

    if (room.capacity === Object.entries(users[room.key]).length) {
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
                    users[room.key][socket.id] = {
                        socketId: socket.id,
                        name: user.name,
                        ip: socket.handshake.address,
                        user: UserResource.make(user,null,['email','phone','status']),
                        media: MediaResource.make(user,room,data.type),
                    };

                    if (user.id === room.host_id) {
                        host[room.key] = users[room.key][socket.id];
                        host_socket_id[room.key] = socket.id;

                        io.emit('host-joined',{
                            data:{
                                host: host[room.key]
                            },status
                        });
                    } else if (host[room.key]) {
                        socket.emit('host-joined',{
                            data:{
                                host: host[room.key]
                            },status
                        });
                    }
                }
            }
            break;
        case GUEST:
            status = 200;
            const user= {
                name: data.name,
            }
            users[room.key][socket.id] = {
                socketId: socket.id,
                name: user.name,
                ip: socket.handshake.address,
                user: UserResource.make(user,null,['id','email','phone','status']),
                media: MediaResource.make(user,room,data.type),
            };

            if (host[room.key]) {
                socket.emit('host-joined',{
                    data:{
                        host: host[room.key]
                    },status
                });
            }
            break;
        default:
            return;
    }

    io.emit('get-users',{
        data:{users: users[room.key] , from: socket.id},
        status
    });
    io.emit('create-pc',{
        data:{host_id: room.host_id},
        status
    });
    socket.emit('join-stream');
}

module.exports.newMessage = async (io,socket,data,room) => {
    let status = 201;
    let message;
    try {
        if (data.message && data.message.length > 0 && data.message.length <= 100 && typeof data.message === 'string') {
            const user = users[room.key][socket.id];
            message = await Chat.create({
                text: data.message,
                room_id: room.id,
                sender: user.name,
                user_id: user.user.id ?? null,
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
    typistUsers[room.key][socket.id] = {
        name: data.name,
        socketId : socket.id
    };
    socket.broadcast.emit('get-typists',{
        data:{
            typistUsers: typistUsers[room.key]
        }, status:200
    });
}

module.exports.noTyping = async (io,socket,data,room) => {
    delete typistUsers[room.key][socket.id];
    socket.broadcast.emit('get-typists',{
        data:{
            typistUsers: typistUsers[room.key]
        }, status:200
    });
}

module.exports.shareStream = async (io,socket,data,room) => {

    if (socket.id !== host_socket_id[room.key] && data.media === 'camera') {
        return;
    }

    if (data.media === 'camara' && ! users[room.key][socket.id].media.media.remote.camera) {
        return;
    }

    if (data.media === 'audio' && ! users[room.key][socket.id].media.media.remote.microphone) {
        return;
    }

    if (data.media === 'screen' && ! users[room.key][socket.id].media.media.remote.screen) {
        return;
    }

    users[room.key][socket.id].media.settings[data.media] = true;

    socket.to(data.to).emit("get-offer",{
        data: {
            offer: data.offer,
            from: socket.id,
            media: data.media,
            streamID: data.streamID
        } , status: 200
    })
}

module.exports.makeAnswer = async (io,socket,data,room) => {
    socket.to(data.to).emit('answer-made',{
        data:{
            answer: data.answer,
            from: socket.id,
            media: data.media
        } , status: 200
    });
}

module.exports.endStream = async (io,socket,data,room) => {
    if (users[room.key] && users[room.key][socket.id].media) {
        users[room.key][socket.id].media.settings[data.media] = false;
        io.emit('end-stream',{
            data: {
                camera: data.media === 'camera',
                screen: data.media === 'screen',
                audio: data.media === 'audio',
                streamID: data.streamID,
                from: socket.id
            }
        });
    }

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
    if (host[room.key] && socket.id === host_socket_id[room.key]) {
        const user = users[room.key][data.to];
        users[room.key][data.to].media.media.remote[data.device] = !user.media.media.remote[data.device];

        io.emit('get-users',{
            data:{
                users: users[room.key] , from: socket.id
            },
            status: 200
        });
    }
}

module.exports.controlLocalMedia = async (io,socket,data,room) => {
    const user = users[room.key][socket.id];
    let status;
    if (data.hasOwnProperty('action')) {
        status = data.action;
    } else {
        status = ! user.media.media.local[data.device];
    }

    if (user) {
        users[room.key][socket.id].media.media.local[data.device] = status;

        io.emit('get-users',{
            data:{
                users: users[room.key], from: socket.id
            },
            status: 200
        });
    }
}

module.exports.handRising = async (io,socket,data,room) => {
    if (socket.id === host_socket_id[room.key] || data.to === socket.id) {
        const user = users[room.key][data.to];
        users[room.key][data.to].media.settings.hand_rising = ! user.media.settings.hand_rising;

        if (socket.id !== host_socket_id[room.key] && host[room.key]) {
            socket.to(host_socket_id[room.key]).emit('client-risen-hand',{
                data:{
                    sender: user.name,
                    status: users[room.key][data.to].media.settings.hand_rising
                }
            });
        }

        io.emit('get-users',{
            data:{
                users: users[room.key], from: socket.id
            },
            status: 200
        });
    }
}

module.exports.disconnect = async (io,socket,data,room) => {
    if (users[room.key][socket.id]) {
        if (users[room.key][socket.id] === host[room.key]) {
            delete host[room.key];
            delete host_socket_id[room.key];
            io.emit('host-joined',{
                data:{
                    host: null
                },status: 200
            });
        }

        io.emit('end-stream',{
            data: {
                camera: users[room.key][socket.id].media.settings.camera,
                screen: users[room.key][socket.id].media.settings.screen,
                audio: users[room.key][socket.id].media.settings.audio,
                from: socket.id
            }
        });
        delete users[room.key][socket.id];
        if (typistUsers[room.key][socket.id]) {
            delete typistUsers[room.key][socket.id];
        }

        io.emit('get-users',{
            data:{
                users: users[room.key] , from: socket.id
            },
            status: 200
        });
    }
}

module.exports.kickClient = async (io,socket,data,room) => {
    if (host[room.key] && socket.id === host_socket_id[room.key] && host_socket_id[room.key] !== data.to) {
        const user = users[room.key][data.to];

        await Penalty.create({
            kicked_at: Date.now() + 2 * 60 * 60 * 1000 ,
            room_id: room.id,
            user_id: user?.user?.id,
            user_ip: user.ip,
        });

        delete users[room.key][data.to];
        delete typistUsers[room.key][data.to];


        socket.to(data.to).emit('error',{
            data:{
                code: 403
            }
        });

        io.emit('get-users',{
            data:{
                users: users[room.key]
            },
            status: 200
        });
    }
}
