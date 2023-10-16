import * as Yup from "yup";

export const GuestSchema = Yup.object().shape({
    name: Yup.string('فیلد نام باید متن باشد')
    .required('فیلد نام الزامی می باشد')
    .max(100,'حداقل طول برای نام 100 کارکتر می باشد'),
});

export const forgetSchema = Yup.object().shape({
    phone: Yup.string()
        .required('فیلد شماره همراه الزامی می باشد'),
});

export const resetPasswordSchema = Yup.object().shape({
    phone: Yup.string()
        .required('فیلد شماره همراه الزامی می باشد'),
    password: Yup.string('فیلد رمز باید متن باشد')
        .min(4,'حداقل رمز برای نام 4 کارکتر می باشد')
        .max(240,'حداقل طول برای رمز 240 کارکتر می باشد')
        .required('فیلد رمز عبور الزامی می باشد'),
    floatingConfirmation: Yup.string('فیلد تایید رمز باید متن باشد')
        .required('فیلد تایید رمز الزامی می باشد').oneOf([Yup.ref('password'),null],"فیلذ تایید رمز مطابقت ندارد"),
    code: Yup.number()
        .required('فیلد کد تایید الزامی می باشد'),
});


export const loginSchema = Yup.object().shape({
  phone: Yup.string()
    .required('فیلد شماره همراه الزامی می باشد'),
  password: Yup.string('فیلد رمز باید متن باشد')
    .min(4,'حداقل رمز برای نام 4 کارکتر می باشد')
    .max(240,'حداقل طول برای رمز 240 کارکتر می باشد')
    .required('فیلد رمز عبور الزامی می باشد'),
});

export const getTokenSchema = Yup.object().shape({
    phone: Yup.string()
        .required('فیلد شماره همراه الزامی می باشد')
});

export const verifyTokenSchema = Yup.object().shape({
    phone: Yup.string()
        .required('فیلد شماره همراه الزامی می باشد'),
    code: Yup.number()
        .required('فیلد کد تایید الزامی می باشد'),
});

export const registerSchema = Yup.object().shape({
    phone: Yup.string()
        .required('فیلد شماره همراه الزامی می باشد'),
  name: Yup.string('فیلد نام باید متن باشد')
    .required('فیلد نام الزامی می باشد')
    .min(2,'حداقل طول برای نام 2 کارکتر می باشد')
    .max(255,'حداقل طول برای نام 255 کارکتر می باشد'),
  email: Yup.string('فیلد ایمیل باید متن باشد')
    .required('فیلد ایمیل الزامی می باشد')
    .email('ایمیل وارد شده باید یک ایمیل معتبر باشد'),
  password: Yup.string('فیلد رمز باید متن باشد')
    .min(4,'حداقل رمز برای نام 4 کارکتر می باشد')
    .max(240,'حداقل طول برای رمز 240 کارکتر می باشد')
    .required('فیلد رمز عبور الزامی می باشد'),
    floatingConfirmation: Yup.string('فیلد تایید رمز باید متن باشد')
    .required('فیلد تایید رمز الزامی می باشد').oneOf([Yup.ref('password'),null],"فیلذ تایید رمز مطابقت ندارد"),
    code: Yup.number()
        .required('فیلد کد تایید الزامی می باشد'),
});
