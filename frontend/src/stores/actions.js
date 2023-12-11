import Swal from "sweetalert2";

export const actions = {
    fillRTCs({state , dispatch} , clients){
        for (const index in clients) {
            if (state.user.user && index !== state.socket.id) {
                if ( ! state.peerConnections[index] || ! state.peerConnections[index]['pc'] ) {
                    state.peerConnections[index] = {
                        user_id: clients[index].user.id,
                        pc: {
                            audio:{
                                local: new RTCPeerConnection({
                                    iceServers: [
                                        { urls: 'stun:stun.l.google.com:19302' },
                                    ],
                                }),
                                remote: new RTCPeerConnection({
                                    iceServers: [
                                        { urls: 'stun:stun.l.google.com:19302' },
                                    ],
                                }),
                            },
                            video:{
                                local: new RTCPeerConnection({
                                    iceServers: [
                                        { urls: 'stun:stun.l.google.com:19302' },
                                    ],
                                }),
                                remote: new RTCPeerConnection({
                                    iceServers: [
                                        { urls: 'stun:stun.l.google.com:19302' },
                                    ],
                                }),
                            },
                            screen: new RTCPeerConnection({
                                iceServers: [
                                    { urls: 'stun:stun.l.google.com:19302' },
                                ],
                            })
                        }
                    };
                    state.peerConnections[index]['pc']['video']['remote'].ontrack = async function (stream) {
                        if (stream.track.kind === 'video') {
                            let video = document.getElementById('video-player');
                            video.srcObject = stream.streams[0];
                            video.load();
                        }
                    };
                    state.peerConnections[index]['pc']['audio']['remote'].ontrack = async function (stream) {
                        if(stream.track.kind === 'audio') {
                            const audio = document.createElement('audio');
                            audio.autoplay = 1;
                            audio.controls = 1;
                            audio.classList.add('hidden');
                            audio.id = stream.streams[0].id;
                            audio.muted = ! (localStorage.getItem('sound') == 'true');
                            audio.srcObject = stream.streams[0];
                            audio.load();
                            document.getElementById('main').appendChild(audio);
                        }
                    };
                    state.peerConnections[index]['pc']['screen'].ontrack = async function (stream) {
                        document.getElementById('screen-player').srcObject = stream.streams[0];
                    };
                }
            }
        }
    },
    joinStream({state , dispatch} , clients){
        for (const index in clients) {
            if (state.user.user && index !== state.socket.id) {
                if (clients[index].media.settings.camera) {
                    state.socket.emit('get-shared' , {
                        from: state.socket.id,
                        to: index,
                        media: 'camera'
                    })
                }
                if (clients[index].media.settings.audio) {
                    state.socket.emit('get-shared' , {
                        from: state.socket.id,
                        to: index,
                        media: 'audio'
                    })
                }
                if (clients[index].media.settings.screen) {
                    state.socket.emit('get-shared' , {
                        from: state.socket.id,
                        to: index,
                        media: 'screen'
                    })
                }
            }
        }
    },
    async shareStream(context , data) {
        if (data.hasOwnProperty('screen') && data.screen) {
            let constraints = { video: true, audio: false};
            navigator.mediaDevices.getDisplayMedia(constraints).then(async function(stream){
                stream.getVideoTracks()[0].onended = function () {
                    context.dispatch('endScreen',{
                        media: 'screen'
                    })
                };
                context.state.displayStream = stream;
                context.state.shareScreen = true;
                for (const id in context.state.peerConnections) {
                    if (context.state.peerConnections[id]['pc']) {
                        context.state.displayStream.getTracks().forEach(track => {
                            track.shareing = true;
                            context.state.peerConnections[id]['pc']['screen'].addTrack(track,stream)
                        });
                        await context.dispatch('startStream',{
                            from: context.state.socket.id,
                            to: id,
                            media: data.media,
                            streamID: stream.id
                        })
                    }
                }
            });
        } else if (data.media === 'camera') {
            let constraints = {
                video: data.video ? ( {deviceId: context.state.selectedVideoDevice ? {exact: context.state.selectedVideoDevice} : undefined} ) : false,
                audio: false,
            };
            navigator.mediaDevices.getUserMedia(constraints).then(async function (stream) {
                const localStream = stream;
                context.state.videoStream = localStream;
                context.state.showing = true;
                for (const id in context.state.peerConnections) {
                    if (context.state.peerConnections[id]['pc']) {
                        context.state.videoStream.getTracks().forEach(track => {
                            context.state.peerConnections[id]['pc']['video']['local'].addTrack(track,localStream)
                        });

                        await context.dispatch('startStream',{
                            from: context.state.socket.id,
                            to: id,
                            media: data.media,
                            streamID: localStream.id
                        })
                    }
                }
            }).catch(function (err) {
                if (data.media === 'camera') {
                    context.dispatch('setDevices');
                }
            });
        } else {
            let constraints = {
                video: false,
                audio: data.audio ? ( {deviceId: context.state.selectedAudioDevice ? {exact: context.state.selectedAudioDevice} : undefined} ) : false,
            };

            navigator.mediaDevices.getUserMedia(constraints).then(async function (stream) {
                const localStream = stream;
                context.state.localStream = localStream;
                for (const id in context.state.peerConnections) {
                    if (context.state.peerConnections[id]['pc']) {
                        context.state.localStream.getTracks().forEach(track => {
                            context.state.peerConnections[id]['pc']['audio']['local'].addTrack(track,localStream)
                        });

                        await context.dispatch('startStream',{
                            from: context.state.socket.id,
                            to: id,
                            media: data.media,
                            streamID: localStream.id
                        })
                    }
                }
                context.commit('controlMicrophone', context.state.user.media.media.local.microphone);
            }).catch(function (err){
                //
            });
        }
    },
    async startStream({state} , data) {
        let PC , offer;
        if (data.media === 'screen') {
            PC = 'screen'
            offer = await state.peerConnections[data.to]['pc'][PC].createOffer();
            await state.peerConnections[data.to]['pc'][PC].setLocalDescription(new RTCSessionDescription(offer));
        } else if (data.media === 'audio') {
            PC = 'audio'
            offer = await state.peerConnections[data.to]['pc'][PC]['local'].createOffer();
            await state.peerConnections[data.to]['pc'][PC]['local'].setLocalDescription(new RTCSessionDescription(offer));
        } else if (data.media === 'camera') {
            PC = 'video'
            offer = await state.peerConnections[data.to]['pc'][PC]['local'].createOffer();
            await state.peerConnections[data.to]['pc'][PC]['local'].setLocalDescription(new RTCSessionDescription(offer));
        } else return;

        state.socket.emit("share-stream", {
            offer,
            from: data.from,
            to: data.to,
            media: data.media,
            streamID: data.streamID
        });
    },
    async getOffer({state , commit} , data) {
        let PC , answer;
        if (state.peerConnections[data.data.from] && state.peerConnections[data.data.from]['pc']) {
            if (data.data.media === 'screen') {
                PC = 'screen';

                await state.peerConnections[data.data.from]['pc'][PC].setRemoteDescription(
                    new RTCSessionDescription(data.data.offer)
                );

                answer = await state.peerConnections[data.data.from]['pc'][PC].createAnswer();

                await state.peerConnections[data.data.from]['pc'][PC].setLocalDescription(new RTCSessionDescription(answer));

                state.shareScreen = true;
            } else if (data.data.media === 'camera' || data.data.media === 'audio') {
                if (data.data.media === 'camera') {
                    state.hiddenVideo = false;
                    PC = 'video';
                } else {
                    PC = 'audio';
                }

                await state.peerConnections[data.data.from]['pc'][PC]['remote'].setRemoteDescription(
                    new RTCSessionDescription(data.data.offer)
                );

                answer = await state.peerConnections[data.data.from]['pc'][PC]['remote'].createAnswer();

                await state.peerConnections[data.data.from]['pc'][PC]['remote'].setLocalDescription(new RTCSessionDescription(answer));

            } else return;


            if (! state.remoteStreams[data.data.streamID]) {
                state.remoteStreams[data.data.streamID] = data.data.streamID;
            }

            state.socket.emit('make-answer',{
                answer,
                to: data.data.from,
                media: data.data.media
            })
        }
    },
    async answerMade(context , data)  {
        let PC;
        PC = data.data.media === 'screen' ? 'screen' : 'local';
        if (PC === 'screen') {
            PC = 'screen';
            await context.state.peerConnections[data.data.from]['pc'][PC].setRemoteDescription(
                new RTCSessionDescription(data.data.answer)
            );
        } else if (data.data.media === 'camera' || data.data.media === 'audio') {
            PC = data.data.media === 'camera' ? 'video' : 'audio';
            await context.state.peerConnections[data.data.from]['pc'][PC]['local'].setRemoteDescription(
                new RTCSessionDescription(data.data.answer)
            );
        }
        const shared_status = `${data.data.media}_shared`;

        if (! context.state.peerConnections[data.data.from][shared_status]) {
            context.state.peerConnections[data.data.from][shared_status] = true;

            await context.dispatch('startStream',{
                from: context.state.socket.id,
                to: data.data.from,
                media: data.data.media
            });
        }
    },
    async sendShared({state , dispatch} , data) {
        if (state.videoStream && data.data.media === 'camera') {
            state.videoStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc']['video']['local'].addTrack(track, state.videoStream));
            dispatch('startStream',{
                from: state.socket.id,
                to: data.data.from,
                media: data.data.media
            })
        }
        if (state.localStream && data.data.media === 'audio' ) {
            state.localStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc']['audio']['local'].addTrack(track, state.localStream));
            dispatch('startStream',{
                from: state.socket.id,
                to: data.data.from,
                media: data.data.media
            })
        }
        if (state.displayStream && data.data.media === 'screen') {
            state.displayStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc']['screen'].addTrack(track, state.displayStream));
            dispatch('startStream',{
                from: state.socket.id,
                to: data.data.from,
                media: data.data.media
            })
        }
    },
    endStream({state} , data) {
        try {
            let streamID;
            if (state.localStream && data.media === 'audio') {
                streamID = state.localStream.id;
                state.localStream.getTracks().forEach(function(track) { track.stop(); })
                state.localStream = null;
            }

            if (state.videoStream && data.media === 'camera') {
                streamID = state.videoStream.id;
                state.videoStream.getTracks().forEach(function(track) { track.stop(); })
                state.videoStream = null;
                state.showing = false;
            }

            for (const id in state.peerConnections) {
                if (state.peerConnections[id]['pc']) {
                    state.peerConnections[id][`${data.media}_shared`] = false;
                }
            }

            state.socket.emit('end-stream' , {
                media: data.media,
                streamID
            })
        } catch (err) {}
    },
    endScreen({state}  , data) {
        if (state.displayStream) {
            const streamID = state.displayStream.id;
            state.displayStream.getTracks().forEach(function(track) { track.stop(); })
            state.displayStream.getVideoTracks()[0].enabled = false;
            state.shareScreen = false;
            state.displayStream = null;
            for (const id in state.peerConnections) {
                if (state.peerConnections[id]['pc']) {
                    state.peerConnections[id][`${data.media}_shared`] = false;
                }
            }
            state.socket.emit('end-stream' , {
                media: data.media,
                streamID
            })
        }
    },
    clearRemoteStream(context , data){
        if (data.data.hasOwnProperty('camera') && data.data.camera) {
            context.commit('updateHiddenCamera',true);
        }


        if (data.data.from !== context.state.socket.id) {
            if (data.data.hasOwnProperty('screen') && data.data.screen ) {
                context.state.shareScreen = false;
            }
            if (data.data.hasOwnProperty('streamID')) {
                delete context.state.remoteStreams[data.data.streamID];
                const el = document.getElementById(data.data.streamID);
                if (el) {
                    el.remove();
                }
            }
        }
    },
    setDevices({state,dispatch}) {
        function updateDevice() {
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices) => {
                    state.videoInputs = [];
                    state.speakers = [];
                    state.audioInputs = [];
                    let currentVideo = true , currentAudio = true;

                    devices.forEach((device,key) => {

                        if (device.kind === 'videoinput') {
                            if (! state.selectedVideoDevice) {
                                state.selectedVideoDevice = device.deviceId;
                            } else if (device.deviceId === state.selectedVideoDevice) {
                                currentVideo = false;
                            }

                            state.videoInputs.push({
                                label: device.label || 'unknown camera',
                                id: device.deviceId
                            });
                        } else if (device.kind === 'audioinput') {
                            if (! state.selectedAudioDevice) {
                                state.selectedAudioDevice = device.deviceId;
                            } else if (device.deviceId === state.selectedAudioDevice) {
                                currentAudio = false;
                            }

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

                    if (currentVideo && state.videoStream) {
                        dispatch('endStream',{
                            media: 'camera'
                        });
                        state.selectedVideoDevice = null;
                    }

                    if (currentAudio && state.localStream) {
                        dispatch('endStream',{
                            media: 'audio'
                        });
                        state.selectedAudioDevice = null;
                    }


                }).catch((err) => {
                    console.error(`${err.name}: ${err.message}`);
                });
        }

        navigator.mediaDevices.ondevicechange = function(event) {
            updateDevice();
        }
        updateDevice();
    },
    setDefaultDevice({state,dispatch} , value){
        if (value.type === 'camera') {
            state.selectedVideoDevice = value.value;
            // rebuild local stream if user has already shared.
        } else if (value.type === 'microphone') {
            if (state.selectedAudioDevice !== value.value) {
                state.selectedAudioDevice = value.value;
                if (state.localStream) {
                    dispatch('endStream',{
                        media: 'audio'
                    });
                    dispatch('shareStream',{
                        video: false , audio: true , media: 'audio'
                    });
                }
            }
        } else if (value.type === 'speaker') {
            const mediaPlayers = document.querySelectorAll('audio');
            Array.from(mediaPlayers).forEach(async el => {
                el.setSinkId(value.value).then(() => {
                    state.selectedSpeakerDevice = value.value;
                }).catch(error => {
                    let errorMessage = error;
                    if (error.name === 'SecurityError') {
                        errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
                    }
                    Swal.fire({
                        position: 'top-start',
                        text: errorMessage,
                        icon: 'warning',
                        showConfirmButton: false,
                        backdrop: false,
                        timer: 3500,
                    })
                });
            })
        }
    },
}