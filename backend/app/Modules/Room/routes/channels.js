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
            // Share host's camera
            socket.on('share-camera', async data => await SocketV1.shareCamera(io,socket,data,room))
            // Get shared host's camera
            socket.on('get-shared-camera', async data => await SocketV1.getSharedCamera(io,socket,data,room))
            // Share host's camera
            socket.on('camera-make-answer', async data => await SocketV1.cameraMakeAnswer(io,socket,data,room))
            // Share client's screen
            socket.on('share-screen', async data => await SocketV1.shareScreen(io,socket,data,room))
            // Client hand rising
            socket.on('hand-rising', async data => await SocketV1.handRising(io,socket,data,room))
            // Promote client permissions
            socket.on('promotion', async data => await SocketV1.promotion(io,socket,data,room))
            // Demote client permissions
            socket.on('demotion', async data => await SocketV1.demote(io,socket,data,room))
            // Disconnect client
            socket.on('disconnect', async data => await SocketV1.disconnect(io,socket,data,room))
        } else {
            socket.emit('error',{status: 404});
        }
    });
}