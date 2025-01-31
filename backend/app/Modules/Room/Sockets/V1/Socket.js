const jwt = require("jsonwebtoken");
const RabbitMQ = require('../../../../Libraries/Rabbitmq');
// const amqp = require("amqp");
const {GUEST, LOGIN} = require("../../../Auth/Enums/LoginTypes");
const User = require('../../../User/Models/User');
const Penalty = require('../../../User/Models/Penalty');
const Chat = require('../../Models/Chat');
let users = {};
let permissions = {};
let typistUsers = {};
let host = {};
let host_socket_id = {};
const validator = require('validator');
const mediasoup = require('mediasoup')
const config = require('../../../../webRTC/config')
const Room = require('../../../../webRTC/Room')
const Peer = require('../../../../webRTC/Peer')

const UserResource = require('../../../User/Resources/Api/V1/UserResource');
const MediaResource = require('../../Resources/Api/V1/MediaResource');
const ChatResoource = require('../../Resources/Api/V1/ChatResoource');

let workers = []
let nextMediasoupWorkerIdx = 0
let roomList = new Map()

;(async () => {
    await createWorkers()
})()

async function createWorkers() {
    let { numWorkers } = config.mediasoup

    for (let i = 0; i < numWorkers; i++) {
        let worker = await mediasoup.createWorker({
            logLevel: config.mediasoup.worker.logLevel,
            logTags: config.mediasoup.worker.logTags,
            rtcMinPort: config.mediasoup.worker.rtcMinPort,
            rtcMaxPort: config.mediasoup.worker.rtcMaxPort
        })
        worker.on('died', () => {
            console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid)
            setTimeout(() => process.exit(1), 2000)
        })
        workers.push(worker)
    }
}

function getMediasoupWorker() {
    const worker = workers[nextMediasoupWorkerIdx]

    if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0

    return worker
}

module.exports.createRoom2 = async (io,socket,data,room , callback) => {
    if (roomList.has(room.key)) {
        callback('already exists')
    } else {
        console.log('Created room', { room_id: room.key })
        let worker = await getMediasoupWorker()
        roomList.set(room.key, new Room(room.key, worker, io))
        callback(room.key)
    }
}

module.exports.join2 = async (io,socket,{ room_id, name },room , callback) => {
    console.log('User joined', {
        room_id: room_id,
        name: name
    })

    if (!roomList.has(room_id)) {
        return callback({
            error: 'Room does not exist'
        })
    }

    roomList.get(room_id).addPeer(new Peer(socket.id, name))
    socket.room_id = room_id

    callback(roomList.get(room_id).toJson())
}


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

    if (! host_socket_id[room.key]) {
        host_socket_id[room.key] = {};
    }
}

module.exports.shareFile = async (io,socket,data,room) => {
    users[room.key][socket.id].media.settings.file = data;
    users[room.key][socket.id].media.media.remote.screen = true;
    io.emit('share-file',data);
}

module.exports.shareFileTo = async (io,socket,data,room) => {
    socket.to(data.to).emit('share-file',data.file);
}

module.exports.getShareFile = async (io,socket,data,room) => {
    socket.to(data.to).emit('share-file',data.file);
}

module.exports.join = async (io,socket,data,room) => {
    let status = 404;
    if (room.capacity === Object.entries(users[room.key] ?? {}).length) {
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
                    let media
                    if (permissions.hasOwnProperty(room.key) && permissions[room.key].hasOwnProperty(user.id)) {
                        const p = permissions[room.key][user.id]
                        media = {
                            host: p.host,
                            type: p.type,
                            media: {
                                local:{
                                    audio: false,
                                    screen: false,
                                    microphone: false,
                                    camera: false,
                                },
                                remote:{
                                    audio: p.media.remote.audio ?? false,
                                    screen: p.media.remote.screen ?? false,
                                    microphone: p.media.remote.microphone ?? false,
                                    camera: p.media.remote.camera ?? false,
                                }
                            },
                            settings: {
                                hand_rising: p.settings.hand_rising ?? false,
                                camera: p.settings.camera ?? false,
                                audio: p.settings.audio ?? false,
                                screen: p.settings.screen ?? false,
                                file: p.settings.file ?? false,
                            }
                        }
                    } else {
                        media = MediaResource.make(user,room,data.type)
                    }
                    if (users && users.hasOwnProperty(room.key)) {
                        users[room.key][socket.id] = {
                            id: user.id,
                            socketId: socket.id,
                            name: user.name,
                            room: room.title,
                            ip: socket.handshake.address,
                            user: UserResource.make(user,null,['email','phone','status'],LOGIN),
                            media,
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
            }
            break;
        case GUEST:
            status = 200;
            const ip = socket.handshake.address;
            const user= {
                name: data.name,
                id: ip
            }
            let media
            if (permissions.hasOwnProperty(room.key) && permissions[room.key].hasOwnProperty(user.id)) {
                const p = permissions[room.key][user.id]
                media = {
                    host: p.host,
                    type: p.type,
                    media: {
                        local:{
                            audio: false,
                            screen: false,
                            microphone: false,
                            camera: false,
                        },
                        remote:{
                            audio: p.media.remote.audio ?? false,
                            screen: p.media.remote.screen ?? false,
                            microphone: p.media.remote.microphone ?? false,
                            camera: p.media.remote.camera ?? false,
                        }
                    },
                    settings: {
                        hand_rising: p.settings.hand_rising ?? false,
                        camera: p.settings.camera ?? false,
                        audio: p.settings.audio ?? false,
                        screen: p.settings.screen ?? false,
                        file: p.settings.file ?? false,
                    }
                }
            } else {
                media = MediaResource.make(user,room,data.type)
            }
            if (users && users.hasOwnProperty(room.key)) {
                users[room.key][socket.id] = {
                    socketId: socket.id,
                    name: user.name,
                    room: room.title,
                    ip,
                    user: UserResource.make(user,null,['email','phone','status'],GUEST),
                    media: media,
                };
                if (host[room.key]) {
                    socket.emit('host-joined',{
                        data:{
                            host: host[room.key]
                        },status
                    });
                }
            }
            break;
        default:
            return;
    }
    await RabbitMQ.directPublish('rooms',`users`,JSON.stringify({
        users: users[room.key],
        room_id: room.id
    }),'lists');
    if (users[room.key] && users[room.key].hasOwnProperty(socket.id)) {
        socket.broadcast.emit("join-the-streams" , {
            from: users[room.key][socket.id]
        })
    }
    io.emit('get-users',{
        data:{
            users: users[room.key] ,
            from: socket.id,
            event: 'joined'
        },
        status
    });
    socket.emit('join' , {
        user: users[room.key][socket.id]
    })
}

module.exports.getProducers = async (io,socket,data,room) => {
    if (!roomList.has(room.key)) return
    console.log('Get producers', { name: `${roomList.get(room.key).getPeers().get(socket.id).name}` })
    let producerList = roomList.get(room.key).getProducerListForPeer()

    socket.emit('newProducers', producerList)
}

module.exports.getRouterRtpCapabilities = async (io,socket,data,room , callback) => {
    console.log('Get RouterRtpCapabilities', {
        name: `${roomList.get(room.key).getPeers().get(socket.id)?.name}`
    })
    try {
        callback(roomList.get(room.key).getRtpCapabilities())
    } catch (e) {
        callback({
            error: e.message
        })
    }
}

module.exports.createWebRtcTransport = async (io,socket,data,room , callback) => {
    console.log('Create webrtc transport', {
        name: `${roomList.get(room.key).getPeers().get(socket.id).name}`
    })
    try {
        const { params } = await roomList.get(room.key).createWebRtcTransport(socket.id)
        callback(params)
    } catch (err) {
        callback({
            error: err.message
        })
    }
}

module.exports.connectTransport = async (io,socket,{ transport_id, dtlsParameters },room , callback) => {
    console.log('Connect transport', { name: `${roomList.get(room.key).getPeers().get(socket.id).name}` })

    if (!roomList.has(room.key)) return
    await roomList.get(room.key).connectPeerTransport(socket.id, transport_id, dtlsParameters)

    callback('success')
}

module.exports.produce = async (io,socket,{ kind, rtpParameters, producerTransportId },room , callback) => {
    if (!roomList.has(room.key)) {
        return callback({ error: 'not is a room' })
    }
    let producer_id = await roomList.get(room.key).produce(socket.id, producerTransportId, rtpParameters, kind)

    console.log('Produce', {
        type: `${kind}`,
        name: `${roomList.get(room.key).getPeers().get(socket.id).name}`,
        id: `${producer_id}`
    })

    callback({
        producer_id
    })
}

module.exports.consume = async (io,socket,{ consumerTransportId, producerId, rtpCapabilities },room , callback) => {
    //TODO null handling
    let params = await roomList.get(room.key).consume(socket.id, consumerTransportId, producerId, rtpCapabilities)

    console.log('Consuming', {
        name: `${roomList.get(room.key) && roomList.get(room.key).getPeers().get(socket.id).name}`,
        producer_id: `${producerId}`,
        consumer_id: `${params.id}`
    })

    callback(params)
}

module.exports.resume = async (io,socket,data,room , callback) => {
    await consumer.resume()
    callback()
}

module.exports.producerClosed = async (io,socket,{ producer_id },room) => {
    console.log('Producer close', {
        name: `${roomList.get(room.key) && roomList.get(room.key).getPeers().get(socket.id).name}`
    })
    roomList.get(room.key).closeProducer(socket.id, producer_id)
}

module.exports.exitRoom = async (io,socket,data,room , callback) => {
    console.log('Exit room', {
        name: `${roomList.get(room.key) && roomList.get(room.key).getPeers().get(socket.id).name}`
    })

    if (!roomList.has(room.key)) {
        callback({
            error: 'not currently in a room'
        })
        return
    }
    // close transports
    await roomList.get(room.key).removePeer(socket.id)
    if (roomList.get(room.key).getPeers().size === 0) {
        roomList.delete(room.key)
    }
    callback('successfully exited room')
}

module.exports.getMyRoomInfo = async (io,socket,data,room , callback) => {
    callback(roomList.get(room.key).toJson())
}

module.exports.leave = async (io,socket,data,room) => {
    const user = users[room.key][socket.id]
    if (user && user.hasOwnProperty('user') && permissions.hasOwnProperty(room.key) && permissions[room.key].hasOwnProperty(user.id)) {
        delete permissions[room.key][user.id]
    }
}

module.exports.newMessage = async (io,socket,data,room) => {
    let status = 201;
    let message;
    try {
        if (data.message && data.message.length > 0 && data.message.length <= 200 && typeof data.message === 'string') {
            const user = users[room.key][socket.id];
            await RabbitMQ.directPublish('rooms','logs',JSON.stringify({
                room_id: room.id,
                action: 'new-message',
                user_id: Number(user.user.id) ?? null,
                user_ip: socket.handshake.address,
                user_name: user.name,
            }),'logLists');

            message = await Chat.create({
                text: Buffer.from(validator.escape(data.message),'utf-8').toString('base64'),
                room_id: room.id,
                sender: user.name,
                user_id: Number(user.user.id) ?? null,
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

module.exports.ping = async (io,socket,data,room , callback) => {
    if (typeof callback !== "function") return;

    return callback("ok")
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
    const media = data.media;
    const firstTime = data?.firstTime ?? false
    if (media.includes('screen') && firstTime) {
        users[room.key][socket.id].media.settings.screen = data.streamID.screen;
        users[room.key][socket.id].media.media.remote.screen = true;
        await RabbitMQ.directPublish('rooms','logs',JSON.stringify({
            room_id: room.id,
            action: 'share-screen',
            user_id: Number(users[room.key][socket.id].user.id) ?? null,
            user_ip: socket.handshake.address,
            user_name: users[room.key][socket.id].name,
        }),'logLists');
    }
    if (data.to.length > 0) {
        socket.to(data.to).emit("get-offer",{
            offer: data.offer,
            from: socket.id,
            media: data.media,
            streamID: data.streamID,
            name: users[room.key][socket.id]?.user?.name ?? null
        })
    }
}

module.exports.makeAnswer = async (io,socket, {to , answer , from , media},room) => {
    socket.to(to).emit('answer-made',{
        answer,
        from: socket.id,
        media,
        status: 200
    });
}

module.exports.endStream = async (io,socket,data,room) => {
    if (users[room.key] && users[room.key][socket.id]) {
        if (data.streams.hasOwnProperty('screen')) {
            data.streams['screen'] = users[room.key][socket.id].media.settings.screen;
            data.streams['file'] = users[room.key][socket.id].media.settings.file;
            users[room.key][socket.id].media.settings.screen = false;
            users[room.key][socket.id].media.settings.file = false;
        }

        socket.broadcast.emit('end-stream',{
            streams: data.streams,
            from: socket.id
        });
    }
}

module.exports.controlRemoteMedia = async (io,socket,data,room) => {
    if (users[room.key][socket.id].user.id === room.host_id) {
        const user = users[room.key][data.to];
        users[room.key][data.to].media.media.remote[data.device] = !user.media.media.remote[data.device];

        if (! users[room.key][data.to].media.media.remote[data.device]) {
            users[room.key][data.to].media.media.local[data.device] = users[room.key][data.to].media.media.remote[data.device];
        }

        io.to(data.to).emit('remote-media-controlled' , {
            data: {
                'device': data.device,
                'action':  users[room.key][data.to].media.media.remote[data.device]
            }
        });

        io.emit('get-users',{
            data:{
                users: users[room.key] , from: socket.id
            },
            status: 200
        });
    }
}

module.exports.controlLocalMedia = async (io,socket,data,room) => {
    if (users[room.key] && users[room.key].hasOwnProperty(socket.id)) {
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
        }
    }
    io.emit('get-users',{
        data:{
            users: users[room.key], from: socket.id
        },
        status: 200
    });
}

module.exports.handRising = async (io,socket,data,room) => {
    if (users[room.key] && users[room.key].hasOwnProperty(socket.id) && users[room.key][socket.id]?.user?.id === room?.host_id || data.to === socket.id) {
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
            try {
                await Penalty.create({
                    kicked_at: Date.now() + 2 * 60 * 60 * 1000 ,
                    room_id: room.id,
                    user_id: Number(targetUser?.user?.id),
                    user_ip: targetUser.ip,
                });
            } catch (err) {
                console.log(err)
            }

            socket.to(data.to).emit('error',{
                data:{
                    code: 403
                }
            });
        }
    }
}

module.exports.sendSenderCandidate = async (io,socket,data,room) => {
    socket.to(data.to).emit('add-sender-candidate',{
        ... data,
        from: socket.id
    });
}

module.exports.reconnect = async (io,socket,data,room) => {
    socket.to(data.to).emit("reconnect",{
        media: data.media,
        from: users[room.key][socket.id]
    })
}

module.exports.sendReceiverCandidate = async (io,socket,data,room) => {
    socket.to(data.to).emit('add-receiver-candidate',{
        ... data,
        from: socket.id
    });
}

module.exports.disconnect = async (io,socket,data,room) => {
    console.log('ohoh')
    console.log('Disconnect', {
        name: `${roomList.get(room.key) && roomList.get(room.key).getPeers().get(socket.id)?.name}`
    })
    if (roomList.has(room.key)) {
        await roomList.get(room.key).removePeer(socket.id)
    }
    try {
        if (users && users.hasOwnProperty(room.key) && users[room.key].hasOwnProperty(socket.id) && users[room.key][socket.id]) {
            if (users[room.key][socket.id].user.id === room.host_id) {
                delete host[room.key][socket.id];
                delete host_socket_id[room.key][socket.id];
                io.emit('host-joined',{
                    data:{
                        host: host[room.key]
                    },status: 200
                });
            }
            const streams = {
                screen: users[room.key][socket.id].media.settings.screen,
            }
            io.emit('end-stream',{
                streams,
                from: socket.id
            });
            if (users[room.key][socket.id].user.hasOwnProperty("id")) {
                permissions[room.key] = {}
                permissions[room.key][users[room.key][socket.id].user.id] = users[room.key][socket.id].media
            }
            delete users[room.key][socket.id];
            if (typistUsers[room.key][socket.id]) {
                delete typistUsers[room.key][socket.id];
            }
            await RabbitMQ.directPublish('rooms',`users`,JSON.stringify({
                users: users[room.key],
                room_id: room.id
            }),'lists');

            if (users.hasOwnProperty(room.key) && Object.entries(users[room.key] ?? {}).length === 0) {
                delete users[room.key];
            }

            io.emit('get-users',{
                data:{
                    users: users[room.key] , from: socket.id
                },
                status: 200
            });
        }
    } catch (err) {
        console.log(err)
        io.emit('get-users',{
            data:{
                users: users[room.key] , from: socket.id
            },
            status: 200
        });
    }
}
