const {Router} = require('express');
const UploadController = require('../Controllers/Api/V1/UploadController');
const Teacher = require('../../../Base/Middlewares/Teacher');
const uploadRouterV1 = new Router();

uploadRouterV1.user('/screen-recorder',Teacher).post('/screen-recorder',UploadController.uploadScreenRecorder);
