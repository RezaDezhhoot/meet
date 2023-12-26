export const mutations = {
    setLocalStream(state , stream){
        state.localStream = stream;
    },
    setRoom(state , room) {
        state.room = room;
    },
    setClients(state , clients) {
        state.clients = clients;
    },
    setUser(state,user){
        state.user = user;
    },
    setSocket(state , socket){
        state.socket = socket;
    },
    updateHiddenCamera(state , status) {
        state.hiddenVideo = status;
    },
    controlCamera(state , status){
        try {
            if (! status) {
                state.selectedVideoDevice = null;
            }
            state.showing = status;
            if (state.videoStream) {
                state.videoStream.getVideoTracks()[0].enabled = status;
                state.socket.emit('control-local-media',{
                    device: 'camera',
                    action: status
                });
            }
        } catch (err) {}
    },
    controlMicrophone(state , status) {
        try {
            if (state.localStream) {
                state.localStream.getAudioTracks()[0].enabled = status;
                state.socket.emit('control-local-media',{
                    device: 'microphone',
                    action: status
                });
            }
        } catch (err) {}
    },
    controlSound(state , value){
        state.sound = value.value;
        const mediaPlayers = document.querySelectorAll('audio');
        Array.from(mediaPlayers).forEach(async el => {
            el.muted = ! value.value;
            await el.load();
            await el.play();
        })
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
    }
}