export const state = {
    mainLoading: false,
    mediaLoading: false,
    cameraLoading: false,

    main_content: true,
    progress: 0,
    localStream: null,
    recorderLocalStream: null,
    videoStream: null,
    displayStream: null,
    remoteStreams: {
        camera: {},
        audio: null,
        screen: null
    },

    room: Object,
    host: Object,
    hostClient: Object,

    clients: Array,

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

    content: false,
    shareScreen: false,
    shareFile: false,

    logo: null,

    videoInputs: [],
    audioInputs: [],
    speakers: [],

    selectedVideoDevice: null,
    selectedSpeakerDevice: null,
    selectedAudioDevice: null,

    top: {
        users: true,
        chat: true
    }
}