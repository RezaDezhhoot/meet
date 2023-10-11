const passport = require("passport");

exports.useByApp = (app) => {
    require('../../config/passport');
    app.use(passport.initialize({}));
}



