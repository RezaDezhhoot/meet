const Yup = require('yup');
const {validPhone} = require("../../../../../Base/Constants/Regex");

module.exports = (res) => {
  return Yup.object().shape({
      name: Yup.string().required(res.__("validation.required",res.__('fields.name'))).max(255,res.__("validation.max",res.__('fields.name'),255)),
      email: Yup.string().email(res.__("validation.email")).max(255,res.__("validation.email",res.__('fields.email'),255)),
      phone: Yup.string().required(res.__("validation.required",res.__('fields.phone'))).matches(validPhone,{
          message: res.__("validation.pattern",res.__('fields.phone'))
      }),
      password: Yup.string().min(6,res.__("validation.min",res.__('fields.password'),6)).max(240,res.__("validation.max",res.__('fields.name'),240)).required(res.__("validation.required",res.__('fields.password'))),
      floatingConfirmation: Yup.string().required(res.__("validation.required",res.__('fields.floating_confirmation'))).oneOf([Yup.ref('password'),null],res.__("validation.matches",res.__('fields.password'))),
  });
};