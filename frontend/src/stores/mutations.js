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
    },
    setDevices(state) {
        navigator.mediaDevices.ondevicechange = function(event) {
            state.videoInputs = [];
            state.speakers = [];
            state.audioInputs = [];
            navigator.mediaDevices.enumerateDevices()
                .then(function(devices) {
                    devices.forEach((device,key) => {
                        if (device.kind === 'videoinput') {
                            state.videoInputs.push({
                                label: device.label || 'unknown camera',
                                id: device.deviceId
                            });
                        } else if (device.kind === 'audioinput') {
                            state.audioInputs.push({
                                label: device.label || 'unknown microphone',
                                id: device.deviceId
                            });
                        } else if (device.kind === 'audiooutput') {
                            state.speakers.push({
                                label: device.label || 'unknown speaker',
                                id: device.deviceId
                            });
                        }
                    });
                });

        }
        navigator.mediaDevices
            .enumerateDevices()
            .then((devices) => {
                devices.forEach((device,key) => {
                    if (device.kind === 'videoinput') {
                        state.videoInputs.push({
                            label: device.label || 'unknown camera',
                            id: device.deviceId
                        });
                    } else if (device.kind === 'audioinput') {
                        state.audioInputs.push({
                            label: device.label || 'unknown microphone',
                            id: device.deviceId
                        });
                    } else if (device.kind === 'audiooutput') {
                        state.speakers.push({
                            label: device.label || 'unknown speaker',
                            id: device.deviceId
                        });
                    }
                });
            })
            .catch((err) => {
                console.error(`${err.name}: ${err.message}`);
            });
    },
    setDefaultDevice(state , value){
        if (value.type === 'camera') {
            state.selectedVideoDevice = value.value
            // rebuild local stream if user has shared.
        } else if (value.type === 'microphone') {

        } else if (value.type === 'speaker') {

        }
    },
}