const path = require('path');
const appDir = path.dirname(require.main.filename);
const {Headers} = require('../Base/Middlewares/Headers');
const Useragent = require('../Base/Middlewares/Useragent');
const ValidRoom = require('../Base/Middlewares/ValidRoom');
const rateLimit = require("express-rate-limit");

exports.loadApiRoutes = (app) => {
    // Set global headers:
    app.use('/api',Headers,Useragent.ApiHeaders,rateLimit({
        windowMs: 3 * 60 * 60 * 1000,
        max: 15000,
        message: {
            message: 'too many requests'
        },
        headers: true,
        })
    );

    // Authentication API routes V1:
    const {routerV1} = require(path.join(appDir,'app','Modules/Auth/routes/api.js'));
    app.use('/api/v1/auth',ValidRoom,routerV1);

    // Room API routes V1:
    const {RoomRouterV1} = require(path.join(appDir,'app','Modules/Room/routes/api.js'));
    app.use('/api/v1/rooms',RoomRouterV1);

    // Chat API routes V1:
    const {ChatRouterV1} = require(path.join(appDir,'app','Modules/Room/routes/api.js'));
    app.use('/api/v1/chats',ValidRoom,ChatRouterV1);

    // Setting API routes V1:
    const {settingRouterV1} = require(path.join(appDir,'app','Modules/Settings/routes/api.js'));
    app.use('/api/v1/settings',settingRouterV1);
}