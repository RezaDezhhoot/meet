const http = require("http");
const path = require('path');
const express = require('express');
const app = express();
const appDir = path.dirname(require.main.filename);
const sequelize = require('./config/database');

app.use(express.urlencoded({limit: '5000mb',extended: false}));
app.use(express.json({limit: '5000mb'}));

const server = http.createServer(app);

require(path.join(appDir,'app/Providers/LibraryServiceProvider')).load(app);
require(path.join(appDir,'app/Providers/RouteServiceProvider')).loadApiRoutes(app);
require(path.join(appDir,'app/Providers/SocketServiceProvider')).load(server);

app.use(function( req, res, next){
    return res.status(404).json({
        'message': 'Fallback'
    });
});

sequelize.sync().then(async res => {
    server.listen(process.env.PORT, () => {
        console.log(`Server running in ${process.env.APP_DOMAIN}:${process.env.PORT}`);
        console.log(`Admin panel running in ${process.env.APP_DOMAIN}:${process.env.PORT}/admin`);
    });
}).catch(err => {
    console.log(err);
});
