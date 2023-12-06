const {expect} = require('expect');
const request = require("supertest");
const express = require('express');
const app = express();
const sequelize = require('./config/database');

require('./app/Libraries/Dotenv');
require('./app/Libraries/I18n').useByApp(app);
require('./app/Libraries/Passport').useByApp(app);
const utils = require("./utils/helpers");

app.use(express.urlencoded({extended: false}));
app.use(express.json());

module.exports.app = app;
module.exports.expect = expect;
module.exports.request = request;
module.exports.utils = utils;
module.exports.sequelize = sequelize;
