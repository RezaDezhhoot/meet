const {Router} = require('express');
const UploadController = require('../Controllers/Api/V1/UploadController');
const Teacher = require('../../../Base/Middlewares/Teacher');
const {authenticated} = require('../../Auth/Middlewares/Auth');
const uploadRouterV1 = new Router();
const upload = require('../../../../config/multer')

// uploadRouterV1.use('/screen-recorder',Teacher).post('/screen-recorder',UploadController.uploadScreenRecorder);
uploadRouterV1.post('/',authenticated,upload.single('file'),UploadController.uploadFile);
uploadRouterV1.get('/show/:file',UploadController.showFile);

exports.uploadRouterV1 = uploadRouterV1;