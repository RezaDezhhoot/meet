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

            SocketV1.createRoom(nsp,socket,room)
            // Client join.
            socket.on('join', async data => await SocketV1.join(nsp,socket,data,room))

            // Submit new message
            socket.on('new-message', async data => await SocketV1.newMessage(nsp,socket,data,room))

            // Typing
            socket.on('typing', async data => await SocketV1.typing(nsp,socket,data,room))

            // no Typing
            socket.on('no-typing', async data => await SocketV1.noTyping(nsp,socket,data,room))

            // Control client's remote media
            socket.on('control-remote-media', async data => await SocketV1.controlRemoteMedia(nsp,socket,data,room))

            // Control client's local media
            socket.on('control-local-media', async data => await SocketV1.controlLocalMedia(nsp,socket,data,room))

            // Client hand rising
            socket.on('hand-rising', async data => await SocketV1.handRising(nsp,socket,data,room))

            // Disconnect client
            socket.on('disconnect', async data => await SocketV1.disconnect(nsp,socket,data,room))

            // Kick clint
            socket.on('kick-client', async data => await SocketV1.kickClient(nsp,socket,data,room))

            // Stream
            socket.on('share-stream', async data => await SocketV1.shareStream(nsp,socket,data,room))

            socket.on('make-answer', async data => await SocketV1.makeAnswer(nsp,socket,data,room))

            socket.on('end-stream', async data => await SocketV1.endStream(nsp,socket,data,room))

            socket.on('get-shared', async data => await SocketV1.getShared(nsp,socket,data,room))
            // End stream
            socket.on('send-candidate', async data => await SocketV1.sendCandidate(nsp,socket,data,room))
        } else {
            socket.emit('error',{
                data:{
                    code: 404
                }
            });
        }
    });
}