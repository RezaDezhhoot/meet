const jwt = require("jsonwebtoken");
const {GUEST, LOGIN} = require("../../../Auth/Enums/LoginTypes");
const User = require('../../../User/Models/User');
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
                        user: UserResource.make(user,null,['email','phone','status']),
                        media: MediaResource.make(user,room,data.type),
                    };

                    if (user.id === room.host_id) {
                        host = users[socket.id];
                        host_socket_id = socket.id;
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
    // Checking capacity
    socket.emit('get-me',{
        data:{
            me: users[socket.id]
        },
        status
    })
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
                user_id: user.user.id,
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

module.exports.shareCamera = async (io,socket,data,room) => {
    if (socket.id === host_socket_id) {
        socket.to(data.to).emit("get-camera-offer",{
            data:{
                offer: data.offer,
                from: socket.id
            } ,status: 200
        })
    }
}

module.exports.cameraMakeAnswer = async (io,socket,data,room) => {
    shared_camera = true;
    socket.to(data.to).emit('camera-answer-made',{
        data:{
            answer: data.answer,
            from: socket.id
        } , status: 200
    });
}

module.exports.getSharedCamera = async (io,socket,data,room) => {
    socket.to(host_socket_id).emit('send-shared-camera',{
        data:{
            from: data.from
        }, status: 200
    });
}


module.exports.shareScreen = async (io,socket,data,room) => {

}

module.exports.handRising = async (io,socket,data,room) => {

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