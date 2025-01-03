const RegisterRequest = require("../../../Requests/Api/V1/RegisterRequest");
const GuestRequest = require("../../../Requests/Api/V1/GuestRequest");
const LoginRequest = require("../../../Requests/Api/V1/LoginRequest");
const utils = require("../../../../../../utils/helpers");
const User = require("../../../../User/Models/User");
const Penalty = require("../../../../User/Models/Penalty");
const Token = require("../../../../User/Models/Token");
const UserResource = require('../../../../User/Resources/Api/V1/UserResource');
const passport = require('passport');
const { Op } = require("sequelize");
const {VERIFIED} = require("../../../../User/Enums/status");
const {GUEST, LOGIN} = require("../../../Enums/LoginTypes");
const validate = require("validator");

exports.register = async (req , res) => {
    const errorArr = [];
    try {
        await RegisterRequest(res).validate(req.body, {
            abortEarly: false,
        });
        const phone = req.body.phone;
        const {name , email  , password , code } = req.body;
        if (await User.findOne({ where: {phone} })) {
            errorArr.push({
                filed: 'phone',
                message: res.__('auth.user_has_already_registered')
            });
            return res.status(422).json({ data: errorArr, message: res.__('general.error') });
        }
        let token = await Token.findOne({ where: {
            [Op.and]: [{status: true}, {phone},{value: code},{ expires_at:{ [Op.gt]: Date.now() } }]
        }});
        if (! token ){
            errorArr.push({
                filed: 'phone',
                message: res.__('auth.not_verified_mobile')
            });
            return res.status(422).json({ data: errorArr, message: res.__('general.error') });
        }
        await Token.destroy({where:{phone}});
        const user = await User.create({
            name: validate.escape(name),
            phone: validate.escape(phone),
            password: utils.sha256(validate.escape(password)),
            email: email ? validate.escape(email) : null,
            status: VERIFIED,
            verified_at: Date.now()
        });
        return res.status(201).json({data:UserResource.make(user,utils.makeToken(user),['email','phone','status'],LOGIN),message: res.__('general.success')});
    } catch (e) {
        const errors = utils.getErrors(e);
        return res.status(errors.status).json({ data: errors.errors, message: res.__('general.error') });
    }
}

exports.login = (req , res ,next) => {
    const errorArr = [];
    console.log();
    passport.authenticate(
        'login',
        async(err, user, info) => {
            try {
                await LoginRequest(res).validate(req.body, {
                    abortEarly: false,
                });
                if (err || !user) {
                    errorArr.push({
                        filed: 'phone',
                        message: info.message
                    });
                    return res.status(422).json({ data: errorArr, message: res.__('general.error') });
                }

                req.login(user, { session: false },
                    async(error) => {
                        if (error) {
                            errorArr.push({
                                filed: 'phone',
                                message:  res.__('general.error')
                            });
                            return res.status(422).json({data: errorArr,message: res.__('general.error') });
                        }
                        return res.status(200).json({data:UserResource.make(user,utils.makeToken(user),['email','phone','status'],LOGIN),message:res.__('general.success')});
                    }
                );
            } catch (error) {
                const errors = utils.getErrors(error);
                return res.status(errors.status).json({ data: errors.errors, message: res.__('general.error') });
            }
        }
    )(req, res, next);
}

exports.guest = async (req , res , next) => {
    const errorArr = [];
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const check = await Penalty.findOne({where:{
                user_ip: ip,
                room_id: req.room.id,
                kicked_at: {
                    [Op.gte]: Date.now()
                }
            }});

        if (check){
            errorArr.push({
                filed: 'name',
                message: res.__("general.access_denied")
            });
            return res.status(403).json({
                data: errorArr,
                message: res.__("general.access_denied")
            });
        }

        await GuestRequest(res).validate(req.body, {
            abortEarly: false,
        });

        const user = {
            id: req.connection.remoteAddress,
            name: req.body.name
        };

        return res.status(200).json({
            data: UserResource.make(user,user.id,['phone','status','email'],GUEST),
            message: res.__("general.success")
        });
    } catch (err) {
        console.log(err);
        const errors = utils.getErrors(err);
        return res.status(errors.status).json({ data: errors.errors, message: res.__('general.error') });
    }
}