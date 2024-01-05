const Yup = require('yup');
const {validPhone} = require('../../../../../Base/Constants/Regex');

module.exports = (res) => {
    return Yup.object().shape({
        phone: Yup.string().required(res.__("validation.required",res.__('fields.phone'))).matches(validPhone,{
            message: res.__("validation.pattern",res.__('fields.phone'))
        }).length(11),
        "access-token": Yup.string().required(res.__("validation.required",res.__('fields.token'))),
        "room-address": Yup.string().required(res.__("validation.required",res.__('fields.room-address'))),
        "name":  Yup.string().max(255,res.__("validation.max",res.__('fields.name'),255)),
    });
};