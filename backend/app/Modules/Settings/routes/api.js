const {Router} = require('express');
const SettingController = require('../Controllers/Api/V1/SettingController');

const settingRouterV1 = new Router();

settingRouterV1.get('/base',SettingController.base);

exports.settingRouterV1 = settingRouterV1;