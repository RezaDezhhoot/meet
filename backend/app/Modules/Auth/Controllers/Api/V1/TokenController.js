const GetTokenRequest = require('../../../Requests/Api/V1/GetTokenRequest');
const VerifyTokenRequest = require('../../../Requests/Api/V1/VerifyTokenRequest');
const User = require('../../../../User/Models/User');
const Token = require('../../../../User/Models/Token');
const utils = require('../../../../../../utils/helpers');
const SMS = require('../../../Services/SmsService');
const { Op } = require("sequelize");

exports.store = async (req , res) => {
    const errorArr = [];
    try {
        await GetTokenRequest(res).validate(req.body, {
            abortEarly: false,
        });
        const phone = req.body.phone;

        if (await User.findOne( { where: {phone} } ) ) {
            errorArr.push({
                filed: 'phone',
                message: res.__('auth.user_has_already_registered')
            });
            return res.status(422).json({ data: errorArr, message: res.__('general.error') });
        }
        if (await Token.findOne({
            where: {
                phone,
                expires_at:{
                    [Op.gt]: Date.now()
                },
            }
        })){
            errorArr.push({
                filed: 'phone',
                message: res.__('auth.token_has_already_sent')
            });
            return res.status(403).json({ data: errorArr, message: res.__('general.error') });
        }
        await Token.destroy({
            where: {phone}
        });
        const value = utils.getRandomIntInclusive(1111,9999);

        // Send sms api...
        const status = await SMS.send(phone,value);
        if (status === 200 || process.env.MODE === 'test') {
            const expires_at = Date.now() + 2 * 60 * 1000;
            const token = await Token.create({phone , value, expires_at,status:false});

            return res.status(201).json({ data: {
                phone: token['phone'],
                    country_code:req.body.country_code,
                    expires_at:token['expires_at'],
                    value: (process.env.MODE === 'development' || process.env.MODE === 'test') ? value : undefined
                }, message: res.__('general.success') });
        } else throw res.__('sms.error');
    } catch (exception) {
        const errors = utils.getErrors(exception);
        return res.status(errors.status).json({ data: errors.errors, message: res.__('general.error') });
    }
}

exports.verify = async (req , res) => {
    const errorArr = [];
    try {
        await VerifyTokenRequest(res).validate(req.body, {
            abortEarly: false,
        });
        const phone =  utils.normalizeIranianPhoneNumber(req.body.phone);
        const code = req.body.code;
        if (await User.findOne( { where: {phone} } ) ) {
            errorArr.push({
                filed: 'phone',
                message: res.__('auth.user_has_already_registered')
            });
            return res.status(422).json({ data: errorArr, message: res.__('general.error') });
        }
        const token = await Token.findOne({
            where:{
                phone,
                expires_at: {
                    [Op.gte]: Date.now()
                },
                value:code
            }
        });
        if (token){
            token.status = true;
            await token.save();
            return res.status(200).json({ data: {phone: token['phone'],country_code:token['country_code']},message: res.__('auth.success'), });
        }
        errorArr.push({
            filed: 'code',
            message: res.__('auth.invalid_token')
        });
        return res.status(422).json({ data:errorArr, message: res.__('general.error') });
    } catch (exception) {
        const errors = utils.getErrors(exception);
        return res.status(errors.status).json({ data: errors.errors, message: res.__('general.error') });
    }
}