const Yup = require('yup');

module.exports = (res) => {
    return Yup.object().shape({
        name: Yup.string().required(res.__("validation.required",res.__('fields.name'))).max(30,res.__("validation.max",res.__('fields.name'),30)),
    });
};