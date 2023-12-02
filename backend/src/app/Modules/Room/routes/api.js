const {Router} = require('express');
const RoomController = require('../Controllers/Api/V1/RoomController');
const ChatController = require('../Controllers/Api/V1/ChatController');

const routerV1 = new Router();

const chatRouterV1 = new Router();

routerV1.post('/exists',RoomController.exists);
chatRouterV1.get('/',ChatController.index);

exports.RoomRouterV1 = routerV1;
exports.ChatRouterV1 = chatRouterV1;