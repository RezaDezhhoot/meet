const utils = require('../../../../../../utils/helpers');

exports.make = (user , room , type  ) => {
    const host = user.id === room.host_id;
    return {
        host,
        type,
        media: {
            local:{
                audio: false,
                screen: false,
                microphone: false,
                camera: false
            },
            remote:{
                audio: host,
                screen: host,
                microphone: host,
                camera: host,
            }
        },
        settings: {
            hand_rising: false,
            camera: false,
            audio: false,
            screen: false,
            file: false,
        }
    };
}