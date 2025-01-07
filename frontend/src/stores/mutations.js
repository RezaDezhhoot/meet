import RTCConnection from "../services/RTCConnection";
// window.mediasoupClient = mediasoup

export const mutations = {
    setClients(state , clients) {
        state.clients = clients;
    },

    controlScreenLoader(state , value = true) {
        state.loaders.screen = value;
    },

    setLocalStream(state , stream){
        state.localStream = stream;
    },
    setRecorderLocalStream(state , stream){
        state.recorderLocalStream = stream;
    },
    setRoom(state , room) {
        state.room = room;
    },
    controlUserBox(state , status) {
        state.top.users = status;
    },
    controlChatBox(state , status) {
        state.top.chat = status;
    },
    setContent(state , status) {
        state.content = status;
    },
    setShareScreen(state , status) {
        state.shareScreen = status;
    },
    setShareFile(state , status) {
        state.shareFile = status;
    },
    setUser(state,user){
        state.user = user;
    },
    setSocket(state , socket){
        state.socket = socket;
        state.socket.request = function request(type, data = {}) {
            return new Promise((resolve, reject) => {
                socket.emit(type, data, (data) => {
                    if (data.error) {
                        reject(data.error)
                    } else {
                        resolve(data)
                    }
                })
            })
        }
    },
    updateHiddenCamera(state , status) {
        state.hiddenVideo = status;
    },
    controlCamera(state , status){
        try {
            if (state.videoStream) {
                state.videoStream.getVideoTracks()[0].enabled = status;
            }
            state.socket.emit('control-local-media',{
                device: 'camera',
                action: status
            });
        } catch (err) {}
    },
    controlMicrophone(state , status) {
        try {
            if (state.localStream) {
                state.localStream.getAudioTracks()[0].enabled = status;
            }
            state.socket.emit('control-local-media',{
                device: 'microphone',
                action: status
            });
        } catch (err) {}
    },
    controlSound(state , value){
        state.sound = value.value;
        const mediaPlayers = document.querySelectorAll('audio');
        Array.from(mediaPlayers).forEach(async el => {
            el.volume = value.value ? 1.0 : 0;
            el.load();
        })
        localStorage.setItem('sound' , value.value)
    },
    setLogo(state , value) {
        state.logo = value;
    },
    setHost(state , value = null) {
        state.host = value;
    },
    setHostClient(state , value = null) {
        state.hostClient = value;
    },
    controlMainLoader(state , value = true) {
        state.mainLoading = value;
    },
    controlMediaLoader(state , value = true) {
        state.mediaLoading = value;
    },
    controlCameraLoader(state , value = true) {
        state.cameraLoading = value;
    },
    setMainContent(state , value) {
        state.main_content = value;
    },
    updateProgress(state , value) {
        state.progress = value
    }
}