const OAuthRequest = require("../../../Requests/Api/V1/OAuthRequest");
const OAuthVerifyRequest = require("../../../Requests/Api/V1/OAuthVerifyRequest");
const utils = require("../../../../../../utils/helpers");
const AccessToken = require("../../../Models/AccessToken");
const OAuth = require("../../../Models/OAuth");
const Room = require("../../../../Room/Models/Room");
const User = require("../../../../User/Models/User");
const Setting = require("../../../../Settings/Models/Setting");

const {Op, Utils} = require("sequelize");
const { v4: uuidv4 } = require('uuid');
const {ACCESS_TOKEN} = require("../../../../../Base/Constants/Salt");
const UserResource = require("../../../../User/Resources/Api/V1/UserResource");
const {LOGIN} = require("../../../Enums/LoginTypes");
const {VERIFIED} = require("../../../../User/Enums/status");

exports.generate = async (req , res) => {
    const errorArr = [];
    try {
        await OAuthRequest(res).validate(req.body, {
            abortEarly: false,
        });
        const AccessTokenValue = req.body['access-token'];
        const token = await AccessToken.findOne({
            where: {
                value: AccessTokenValue,
                [Op.or]: [
                    { expire_at: { [Op.gt]: Date.now() } },
                    { expire_at: null }
                ]
            }
        });

        if (token) {
            const room = await Room.findOne({where: {key: req.body['room-address']} });
            const isMatch = await utils.sha256Compare(String(ACCESS_TOKEN+room.owner_id), token.value);
            if (isMatch) {
                let user = await User.findOne({where : {phone: req.body.phone} });
                if (! user) {
                    user = await User.create({
                        phone: req.body.phone,
                        name: req.body.name ?? "کاربر ناشناس",
                        password:  utils.sha256(uuidv4()),
                        status: VERIFIED,
                        verified_at: Date.now()
                    });
                }

                const OAuthToken = await OAuth.create({
                    token: uuidv4(),
                    user_id: user.id,
                    room_id: room.id,
                    expire_at:  Date.now() + 2 * 60 * 1000
                });
                const frontendURL = await Setting.findOne({
                    where:{name: 'room_domain'}
                })
                return res.status(201).json({
                    'link': (frontendURL.value.endsWith('/') ?
                        frontendURL.value.slice(0, -1) :
                        frontendURL.value)+'/oauth/'+OAuthToken.token,
                    'expire_at': OAuthToken.expire_at
                });
            }
        }

        return res.status(403).json({'message': 'access denied'});
    } catch (e) {
        const errors = utils.getErrors(e);
        return res.status(errors.status).json({ data: errors.errors, message: res.__('general.error') });
    }
}

exports.verify = async (req , res) => {
    const errorArr = [];
    try {
        await OAuthVerifyRequest(res).validate(req.body, {
            abortEarly: false,
        });
        const AccessTokenValue = req.body['token'];
        const token = await OAuth.findOne({
            where:{
                token: AccessTokenValue,
                status: false,
                expire_at: {
                    [Op.gte]: Date.now()
                },
            }
        });
        if (! token ) {
            errorArr.push({
                filed: 'phone',
                message: res.__('auth.not_verified_mobile')
            });
            return res.status(422).json({ data: errorArr, message: res.__('general.error') });
        }
        token.status = true;
        await token.save();
        const user = await User.findOne({where: {id: token.user_id}});
        const room = await Room.findOne({where: {id: token.room_id}})
        return res.status(200).json({data:{
                user: UserResource.make(user,utils.makeToken(user),['email','phone','status'],LOGIN),
                room: room.key
            },message:res.__('general.success')});
    } catch (e) {
        console.log(e);
        const errors = utils.getErrors(e);
        return res.status(errors.status).json({ data: errors.errors, message: res.__('general.error') });
    }
}