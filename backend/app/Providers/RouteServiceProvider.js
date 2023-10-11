const path = require('path');
const appDir = path.dirname(require.main.filename);
const {Headers} = require('../Base/Middlewares/Headers');
const Useragent = require('../Base/Middlewares/Useragent');
const rateLimit = require("express-rate-limit");

exports.loadApiRoutes = (app) => {
    // Set global headers:
    app.use('/api',Headers,Useragent.ApiHeaders,rateLimit({
        windowMs: 3 * 60 * 60 * 1000,
        max: 150,
        message: {
            message: 'too many requests'
        },
        headers: true,
        })
    );

    // Authentication API routes V1:
    const {routerV1} = require(path.join(appDir,'app','Modules/Auth/Routes/api.js'));
    app.use('/api/v1/auth',routerV1);
}