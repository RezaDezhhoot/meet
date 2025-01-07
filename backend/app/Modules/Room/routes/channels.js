const Room = require('../Models/Room');
const {OPEN} = require("../Enums/status");
const SocketV1 = require('../Sockets/V1/Socket');

module.exports.ChannelV1 = async (io) => {
    io.on('connection', async  socket => {
        const transport = socket.conn.transport.name; // in most cases, "polling"
        socket.conn.on("upgrade", () => {
            const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
        });

        const namespace = socket.nsp.name.split('-')[1];

        const room = await Room.findOne({where:{key:namespace}});
        if (room && room.status === OPEN) {
            const nsp = socket.nsp;
            await SocketV1.createRoom(nsp,socket,room)
            socket.on('ping', async (data , callback) => await SocketV1.ping(nsp,socket,data,room , callback))
            socket.on('createRoom', async (data , callback) => await SocketV1.createRoom2(nsp,socket,data,room , callback))
            socket.on('join2', async (data , callback) => await SocketV1.join2(nsp,socket,data,room , callback))
            socket.on('join', async data => await SocketV1.join(nsp,socket,data,room))
            socket.on('share-file', async data => await SocketV1.shareFile(nsp,socket,data,room))
            socket.on('share-file-to', async data => await SocketV1.shareFileTo(nsp,socket,data,room))
            socket.on('get-shared-file', async data => await SocketV1.getShareFile(nsp,socket,data,room))
            socket.on('new-message', async data => await SocketV1.newMessage(nsp,socket,data,room))
            socket.on('leave', async data => await SocketV1.leave(nsp,socket,data,room))
            socket.on('typing', async data => await SocketV1.typing(nsp,socket,data,room))
            socket.on('no-typing', async data => await SocketV1.noTyping(nsp,socket,data,room))
            socket.on('control-remote-media', async data => await SocketV1.controlRemoteMedia(nsp,socket,data,room))
            socket.on('control-local-media', async data => await SocketV1.controlLocalMedia(nsp,socket,data,room))
            socket.on('hand-rising', async data => await SocketV1.handRising(nsp,socket,data,room))
            socket.on('disconnect', async data => await SocketV1.disconnect(nsp,socket,data,room))
            socket.on('kick-client', async data => await SocketV1.kickClient(nsp,socket,data,room))
            socket.on('share-stream', async data => await SocketV1.shareStream(nsp,socket,data,room))
            socket.on('make-answer', async data => await SocketV1.makeAnswer(nsp,socket,data,room))
            socket.on('end-stream', async data => await SocketV1.endStream(nsp,socket,data,room))
            socket.on('send-sender-candidate', async data => await SocketV1.sendSenderCandidate(nsp,socket,data,room))
            socket.on('send-receiver-candidate', async data => await SocketV1.sendReceiverCandidate(nsp,socket,data,room))
            socket.on('reconnect', async data => await SocketV1.reconnect(nsp,socket,data,room))

            socket.on('getRouterRtpCapabilities', async (data , callback) => await SocketV1.getRouterRtpCapabilities(nsp,socket,data,room , callback))
            socket.on('getProducers', async (data , callback) => await SocketV1.getProducers(nsp,socket,data,room , callback))
            socket.on('createWebRtcTransport', async (data , callback) => await SocketV1.createWebRtcTransport(nsp,socket,data,room , callback))
            socket.on('connectTransport', async (data , callback) => await SocketV1.connectTransport(nsp,socket,data,room , callback))
            socket.on('produce', async (data , callback) => await SocketV1.produce(nsp,socket,data,room , callback))
            socket.on('consume', async (data , callback) => await SocketV1.consume(nsp,socket,data,room , callback))
            socket.on('resume', async (data , callback) => await SocketV1.resume(nsp,socket,data,room , callback))
            socket.on('getMyRoomInfo', async (data , callback) => await SocketV1.getMyRoomInfo(nsp,socket,data,room , callback))
            socket.on('producerClosed', async (data) => await SocketV1.producerClosed(nsp,socket,data,room))
            socket.on('exitRoom', async (data,callback) => await SocketV1.exitRoom(nsp,socket,data,room,callback))
        } else {
            socket.emit('error',{
                data:{
                    code: 404
                }
            });
        }
    });
}