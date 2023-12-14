export const state = {
    localStream: null,
    videoStream: null,
    displayStream: null,
    remoteStreams: Array,

    room: Object,
    host: Object,

    sound: false,
    user: {
        media:{
            settings: {
                hand_rising: false
            },
            media: {
                remote: {
                    microphone: false,
                    camera: false,
                },
                local: {
                    microphone: false,
                    camera: false,
                }
            }
        }
    },

    peerConnections: Object,

    socket: Object,

    hiddenVideo: true,
    showing: false,
    shareScreen: false,

    logo: null,

    videoInputs: [],
    audioInputs: [],
    speakers: [],

    selectedVideoDevice: null,
    selectedSpeakerDevice: null,
    selectedAudioDevice: null,
}