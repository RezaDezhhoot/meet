const utils = require('../../../../../../utils/helpers');

exports.make = (user , room , type) => {
    const host = user.id === room.host_id;
    return {
        host,
        type,
        media: {
            local:{
                audio: false,
                screen: false,
                microphone: false,
            },
            remote:{
                audio: host,
                screen: host,
                microphone: host,
            }
        },
        settings: {
            hand_rising: false,
            is_speaking: false,
            is_sharing: false
        }
    };
}