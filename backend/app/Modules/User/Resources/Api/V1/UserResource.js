const {USER_PROFILE_IMAGE_FOLDER} = require('../../../../../Base/Constants/File');
const utils = require('../../../../../../utils/helpers');

exports.make = (user , token = null , ignore = []) => {
    ignore.forEach((v , k) => {
        user[v] = undefined;
    });

    return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        status: user.status,
        email: user.email,
        token: token ? token : undefined
    };
}