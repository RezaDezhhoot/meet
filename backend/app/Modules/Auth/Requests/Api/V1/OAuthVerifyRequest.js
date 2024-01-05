const Yup = require('yup');
const {validPhone} = require('../../../../../Base/Constants/Regex');

module.exports = (res) => {
    return Yup.object().shape({
        "token": Yup.string().required(res.__("validation.required",res.__('fields.token'))),
    });
};