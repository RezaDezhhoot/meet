const socketio = require("socket.io");
const path = require("path");
const appDir = path.dirname(require.main.filename);

module.exports.load = async (server) => {
    const IO = socketio(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
        pingTimeout: 60000,
        // maxHttpBufferSize: 1e8,
    });

    const {ChannelV1} = require(path.join(appDir,'app','Modules/Room/routes/channels.js'));

    ChannelV1(IO.of(/^\/channel\/v1-[a-zA-Z0-9]+/i));
}