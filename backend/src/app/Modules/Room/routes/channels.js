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
            // Client join.
            socket.on('join', async data => await SocketV1.join(io,socket,data,room))

            // Submit new message
            socket.on('new-message', async data => await SocketV1.newMessage(io,socket,data,room))

            // Typing
            socket.on('typing', async data => await SocketV1.typing(io,socket,data,room))

            // no Typing
            socket.on('no-typing', async data => await SocketV1.noTyping(io,socket,data,room))

            // Control client's remote media
            socket.on('control-remote-media', async data => await SocketV1.controlRemoteMedia(io,socket,data,room))

            // Control client's local media
            socket.on('control-local-media', async data => await SocketV1.controlLocalMedia(io,socket,data,room))


            // Client hand rising
            socket.on('hand-rising', async data => await SocketV1.handRising(io,socket,data,room))

            // Disconnect client
            socket.on('disconnect', async data => await SocketV1.disconnect(io,socket,data,room))

            // Kick clint
            socket.on('kick-client', async data => await SocketV1.kickClient(io,socket,data,room))

            // Stream
            socket.on('share-stream', async data => await SocketV1.shareStream(io,socket,data,room))

            socket.on('make-answer', async data => await SocketV1.makeAnswer(io,socket,data,room))

            socket.on('end-stream', async data => await SocketV1.endStream(io,socket,data,room))

            socket.on('get-shared', async data => await SocketV1.getShared(io,socket,data,room))
            // End stream
        } else {
            socket.emit('error',{
                data:{
                    code: 404
                }
            });
        }
    });
}