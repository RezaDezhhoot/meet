export const mutations = {
    setLocalStream(state , stream){
        state.localStream = stream;
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
            if (state.localStream) {
                state.localStream.getVideoTracks()[0].enabled = status;
                if (! status) {
                    state.showing = false;
                    state.hiddenVideo = true;
                } else {
                    state.showing = true;
                    state.hiddenVideo = false;
                }
            }
        } catch (err) {}
    },
    controlMicrophone(state , status) {
        try {
            if (state.localStream) {
                state.localStream.getAudioTracks()[0].enabled = status;
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
    }
}