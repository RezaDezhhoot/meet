const jwt = require("jsonwebtoken");
const RabbitMQ = require('../../../../Libraries/Rabbitmq');
// const amqp = require("amqp");
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
const ChatResoource = require('../../Resources/Api/V1/ChatResoource');

module.exports.createRoom = (io , socket , room) => {
    if (! users[room.key]) {
        users[room.key] = {};
    }

    if (! typistUsers[room.key]) {
        typistUsers[room.key] = {};
    }

    if (! host[room.key]) {
        host[room.key] = {};
    }

    if (! host_socket_id[room.key]) {
        host_socket_id[room.key] = {};
    }
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
                        room: room.title,
                        ip: socket.handshake.address,
                        user: UserResource.make(user,null,['email','phone','status'],LOGIN),
                        media: MediaResource.make(user,room,data.type),
                    };

                    if (user.id === room.host_id) {
                        host[room.key][socket.id] = users[room.key][socket.id];
                        host_socket_id[room.key][socket.id] = socket.id;

                        io.emit('host-joined',{
                            data:{
                                host: host[room.key]
                            }, status
                        });

                    } else if (host[room.key]) {
                        socket.emit('host-joined',{
                            data:{
                                host: host[room.key]
                            }, status
                        });
                    }
                }
            }
            break;
        case GUEST:
            status = 200;
            const ip = socket.handshake.address;
            const user= {
                name: data.name,
                id: ip
            }
            users[room.key][socket.id] = {
                socketId: socket.id,
                name: user.name,
                room: room.title,
                ip,
                user: UserResource.make(user,null,['id','email','phone','status'],GUEST),
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
    await RabbitMQ.directPublish('rooms',`users`,JSON.stringify({
        users: users[room.key],
        room_id: room.id
    }),'lists');
    io.emit('get-users',{
        data:{
            users: users[room.key] ,
            from: socket.id,
            event: 'joined'
        },
        status
    });
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
    const media = Object.values(data.media);

    if (media.includes('camera')) {
        if (! users[room.key][socket.id].media.media.remote.camera) {
            delete data.offer['camera'];
        } else {
            users[room.key][socket.id].media.settings.camera = true;
        }
    }

    if (media.includes('audio')) {
        if (! users[room.key][socket.id].media.media.remote.microphone) {
            delete data.offer['audio'];
        } else {
            users[room.key][socket.id].media.settings.audio = true;
        }
    }

    if (media.includes('screen')) {
        if (! users[room.key][socket.id].media.media.remote.screen) {
            delete data.offer['screen'];
        } else {
            users[room.key][socket.id].media.settings.screen = true;
        }
    }

    socket.to(Object.values(data.to)).emit("get-offer",{
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
    if (users[room.key] && users[room.key][socket.id]) {
        let camera = false , screen = false , audio = false;
        if (data.media.includes('camera')) {
            users[room.key][socket.id].media.settings.camera = false;
            camera = true;
        }

        if (data.media.includes('screen')) {
            users[room.key][socket.id].media.settings.screen = false;
            screen = true;
        }

        if (data.media.includes('audio')) {
            users[room.key][socket.id].media.settings.audio = false;
            audio = true;
        }


        io.emit('end-stream',{
            data: {
                camera, screen, audio,
                streamID: data.streamID ?? null,
                screenStreamID: data.screenStreamID ?? null,
                videoStreamID: data.videoStreamID ?? null,
                from: socket.id
            }
        });
    }

}

module.exports.getShared = async (io,socket,data,room) => {
    if (Object.values(data.media).length > 0) {
        socket.to(data.to).emit('send-shared',{
            data:{
                from: data.from,
                media: data.media
            }, status: 200
        });
    }
}

module.exports.controlRemoteMedia = async (io,socket,data,room) => {
    if (users[room.key][socket.id].user.id === room.host_id) {
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

    if (user) {
        if (data.hasOwnProperty('action')) {
            status = data.action;
        } else {
            status = ! user.media.media.local[data.device];
        }

        users[room.key][socket.id].media.media.local[data.device] = status;

        if (user.user.id === room.host_id) {
            host[room.key][socket.id] = user;
            io.emit('host-joined',{
                data:{
                    host: host[room.key]
                },status: 200
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

module.exports.handRising = async (io,socket,data,room) => {
    if (users[room.key][socket.id].user.id === room.host_id || data.to === socket.id) {
        const user = users[room.key][data.to];
        users[room.key][data.to].media.settings.hand_rising = ! user.media.settings.hand_rising;

        if (users[room.key][socket.id].user.id !== room.host_id && Object.entries(host[room.key]).length > 0) {
            socket.to(
                Object.values(host_socket_id[room.key])
            ).emit('client-risen-hand',{
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

module.exports.kickClient = async (io,socket,data,room) => {
    if (data.hasOwnProperty('to')) {
        const user = users[room.key][socket.id];
        const targetUser = users[room.key][data.to];
        if (user.user.id === room.host_id && targetUser.user.id !== room.host_id) {
            const user = users[room.key][data.to];

            await Penalty.create({
                kicked_at: Date.now() + 2 * 60 * 60 * 1000 ,
                room_id: room.id,
                user_id: user?.user?.id,
                user_ip: user.ip,
            });

            delete users[room.key][data.to];
            delete typistUsers[room.key][data.to];

            await RabbitMQ.directPublish('rooms',`users`,JSON.stringify({
                users: users[room.key],
                room_id: room.id
            }),'lists');

            socket.to(data.to).emit('error',{
                data:{
                    code: 403
                }
            });

            await RabbitMQ.directPublish('rooms',`users`,JSON.stringify(users),'list');
            io.emit('get-users',{
                data:{
                    users: users[room.key]
                },
                status: 200
            });
        }
    }
}

module.exports.sendCandidate = async (io,socket,data,room) => {
    socket.broadcast.emit('add-candidate',{
        data
    });
}

module.exports.disconnect = async (io,socket,data,room) => {
    if (users[room.key][socket.id]) {
        if (users[room.key][socket.id].user.id === room.host_id) {
            delete host[room.key][socket.id];
            delete host_socket_id[room.key][socket.id];
            io.emit('host-joined',{
                data:{
                    host: host[room.key]
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
        await RabbitMQ.directPublish('rooms',`users`,JSON.stringify({
            users: users[room.key],
            room_id: room.id
        }),'lists');

        if (Object.entries(users[room.key]).length === 0) {
            delete users[room.key];
        }

        io.emit('get-users',{
            data:{
                users: users[room.key] , from: socket.id
            },
            status: 200
        });
    }
}
