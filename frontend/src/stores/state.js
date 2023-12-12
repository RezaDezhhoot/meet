export const state = {
    localStream: null,
    videoStream: null,
    displayStream: null,
    remoteStreams: Array,

    sound: false,
    user: null,

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