const {Router} = require('express');
const RoomController = require('../Controllers/Api/V1/RoomController');
const ChatController = require('../Controllers/Api/V1/ChatController');

const routerV1 = new Router();

const chatRouterV1 = new Router();

routerV1.get('/exists',RoomController.exists);
routerV1.get('/:room',RoomController.show);
chatRouterV1.get('/',ChatController.index);

exports.RoomRouterV1 = routerV1;
exports.ChatRouterV1 = chatRouterV1;