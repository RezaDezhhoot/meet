const {Router} = require('express');
const {guest} = require('../Middlewares/Guest');
const AuthController = require('../Controllers/Api/V1/AuthController');
const TokenController = require('../Controllers/Api/V1/TokenController');
const OAuthController = require('../Controllers/Api/V1/OAuthController');
const ForgetPasswordController = require('../Controllers/Api/V1/ForgetPasswordController');
const rateLimit = require("express-rate-limit");
const ValidRoom = require('../../../Base/Middlewares/ValidRoom');

const routerV1 = new Router().use(guest);

routerV1.use(ValidRoom).use('/register/get-token',
    rateLimit({
        windowMs: 3 * 60 * 60 * 1000,
        max: 6,
        message: {
            message: 'too many requests'
        },
        headers: true,
    })
).post('/register/get-token',TokenController.store);

routerV1.use(ValidRoom).post('/register/verify-token',TokenController.verify);

routerV1.use(ValidRoom).post('/register',AuthController.register);

routerV1.use(ValidRoom).post('/login',AuthController.login);

routerV1.use(ValidRoom).post('/guest',AuthController.guest);

routerV1.use(ValidRoom).use('/forget-password',
    rateLimit({
        windowMs: 3 * 60 * 60 * 1000,
        max: 6,
        message: {
            message: 'too many requests'
        },
        headers: true,
    })
).post('/forget-password',ForgetPasswordController.store);

routerV1.use(ValidRoom).patch('/reset-password',ForgetPasswordController.reset);

routerV1.post('/oauth/generate',OAuthController.generate);

routerV1.post('/oauth/verify',OAuthController.verify);

exports.routerV1 = routerV1;