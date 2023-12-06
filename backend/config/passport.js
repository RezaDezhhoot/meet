const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('../app/Modules/User/Models/User');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const utils = require("../utils/helpers");
const {ADMIN, ADMINSTRATOR} = require("../app/Base/Constants/Role");
const Penalty = require("../app/Modules/User/Models/Penalty");
const {Op} = require("sequelize");

passport.use(
    'login',
    new localStrategy({
            passReqToCallback: true,
            usernameField: 'phone',
            passwordField: 'password'
        },
        async(req,phone, password, done) => {
            try {

                const user = await UserModel.findOne({ where: {phone} });
                if (!user) {
                    return done(null, false, { message: req.__('auth.invalid_mobile_or_password') });
                }

                const check = await Penalty.findOne({where:{
                        user_id: user.id,
                        room_id: req.room.id,
                        kicked_at: {
                            [Op.gte]: Date.now()
                        }
                    }});

                if (check) {
                    return done(null, false, { message: req.__('general.access_denied') });
                }

                const isMatch = await utils.sha256Compare(password, user.password);

                if (isMatch){
                    return done(null,user);
                } else {
                    return done(null,false,{
                        message: req.__('auth.invalid_mobile_or_password')
                    });
                }

                return done(null, user, { message: req.__('auth.login') });
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(new JWTstrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    },
    (jwtPayload, cb) => {
        return UserModel.findOne({ where: {phone : jwtPayload.user.phone} })
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});