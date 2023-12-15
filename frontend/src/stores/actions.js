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

                dispatch('joinStream',clients[index]);
            }
        }
    },
    joinStream({state , dispatch} , client){
        let media = [];

        if (client.media.settings.camera) {
            media.push('camera');
        }
        if (client.media.settings.audio) {
            media.push('audio');
        }
        if (client.media.settings.screen) {
            media.push('screen');
        }

        if (media.length > 0) {
            state.socket.emit('get-shared' , {
                from: state.socket.id,
                to: client.socketId,
                media
            })
        }
    },
    async shareStream(context , data) {
        let constraints , media , to = [];
        if (data.hasOwnProperty('screen') && data.screen) {
            constraints = { video: true, audio: false};
            navigator.mediaDevices.getDisplayMedia(constraints).then(async function(stream){
                stream.getVideoTracks()[0].onended = function () {
                    context.dispatch('endScreen',{
                        media: 'screen'
                    })
                };
                context.state.displayStream = stream;
                context.state.shareScreen = true;
                media = 'screen';
                for (const id in context.state.peerConnections) {
                    if (context.state.peerConnections[id]['pc']) {
                        context.state.displayStream.getTracks().forEach(track => {
                            track.shareing = true;
                            context.state.peerConnections[id]['pc']['screen'].addTrack(track,stream)
                        });
                        to.push(id);
                    }
                }
            }).then(async () => {
                await context.dispatch('startStream',{from: context.state.socket.id,to ,media: [media] })
            }).catch(function (err) {
                console.log(err);
                context.dispatch('endScreen');
                Swal.fire({
                    position: 'top-start',
                    text: "مشکلی در عملیات اشتراک گذاری رخ داده است!",
                    icon: 'warning',
                    showConfirmButton: false,
                    backdrop: false,
                    timer: 3500,
                })
            });
        } else if (data.media === 'camera') {
            constraints = {
                video: data.video ? ( {deviceId: context.state.selectedVideoDevice ? {exact: context.state.selectedVideoDevice} : undefined} ) : false,
                audio: false,
            };
            navigator.mediaDevices.getUserMedia(constraints).then(async function (stream) {
                const localStream = stream;
                context.state.videoStream = localStream;
                context.state.showing = true;
                media = 'camera';
                context.state.socket.emit('control-local-media',{
                    device: 'camera',
                    action: true
                });

                for (const id in context.state.peerConnections) {
                    if (context.state.peerConnections[id]['pc']) {
                        context.state.videoStream.getTracks().forEach(track => {
                            context.state.peerConnections[id]['pc']['video']['local'].addTrack(track,localStream)
                        });
                        to.push(id);
                    }
                }
            }).then(async () => {
                await context.dispatch('startStream',{from: context.state.socket.id,to ,media: [media] })
            }).catch(function (err) {
                console.log(err);
                context.dispatch('setDevices');
                context.dispatch('endStream',{
                    media: ['camera']
                });
                Swal.fire({
                    position: 'top-start',
                    text: "دوربینی یافت نشد!",
                    icon: 'warning',
                    showConfirmButton: false,
                    backdrop: false,
                    timer: 3500,
                })
            });
        } else {
            constraints = {
                video: false,
                audio: data.audio ? ( {deviceId: context.state.selectedAudioDevice ? {exact: context.state.selectedAudioDevice} : undefined} ) : false,
            };

            navigator.mediaDevices.getUserMedia(constraints).then(async function (stream) {
                const localStream = stream;
                context.state.localStream = localStream;
                media = 'audio';
                context.state.user.media.media.local.microphone = true;
                context.state.socket.emit('control-local-media',{
                    device: 'microphone',
                    action: true
                });

                for (const id in context.state.peerConnections) {
                    if (context.state.peerConnections[id]['pc']) {
                        context.state.localStream.getTracks().forEach(track => {
                            context.state.peerConnections[id]['pc']['audio']['local'].addTrack(track,localStream)
                        });
                        to.push(id);
                    }
                }
                context.commit('controlMicrophone', context.state.user.media.media.local.microphone);
            }).then(async () => {
                await context.dispatch('startStream',{from: context.state.socket.id,to ,media: [media] })
            }).catch(function (err){
                console.log(err);
                context.dispatch('setDevices');
                context.dispatch('endStream',{
                    media: ['audio']
                });
                Swal.fire({
                    position: 'top-start',
                    text: "میکروفونی یافت نشد!",
                    icon: 'warning',
                    showConfirmButton: false,
                    backdrop: false,
                    timer: 3500,
                })
            });
        }
    },
    async startStream({state} , data) {
        const media = Object.values(data.media);
        let offer = {} , streamID = {};
        if (media.length > 0) {
            for (const v of data.to) {
                // Make RTC screen offer
                if (media.includes('screen')) {
                    offer['screen'] = await state.peerConnections[v]['pc']['screen'].createOffer();
                    streamID['screen'] = state.displayStream.id;
                    await state.peerConnections[v]['pc']['screen'].setLocalDescription(new RTCSessionDescription(offer['screen']));
                }
                // Make RTC audio offer
                if (media.includes('audio')) {
                    offer['audio'] = await state.peerConnections[v]['pc']['audio']['local'].createOffer();
                    streamID['audio'] = state.localStream.id;
                    await state.peerConnections[v]['pc']['audio']['local'].setLocalDescription(new RTCSessionDescription(offer['audio']));
                }
                // Make RTC video offer
                if (media.includes('camera')) {
                    offer['camera'] = await state.peerConnections[v]['pc']['video']['local'].createOffer();
                    streamID['camera'] = state.videoStream.id;
                    await state.peerConnections[v]['pc']['video']['local'].setLocalDescription(new RTCSessionDescription(offer['camera']));
                }

                // Broadcast offers
                state.socket.emit("share-stream", {
                    offer,
                    from: data.from,
                    to: [v],
                    media: data.media,
                    streamID
                });
            }
        }
    },
    async getOffer({state , commit} , data) {
        const media = Object.values(data.data.media);
        let answer = {};
        if (state.peerConnections[data.data.from] && state.peerConnections[data.data.from]['pc'] && media.length > 0) {
            // Make RTC screen answer
            if (media.includes('screen') && data.data.offer.hasOwnProperty('screen')) {
                await state.peerConnections[data.data.from]['pc']['screen'].setRemoteDescription(
                    new RTCSessionDescription(data.data.offer.screen)
                );
                answer['screen'] = await state.peerConnections[data.data.from]['pc']['screen'].createAnswer();
                await state.peerConnections[data.data.from]['pc']['screen'].setLocalDescription(new RTCSessionDescription(answer['screen']));
                state.shareScreen = true;

                if (! state.remoteStreams[data.data.streamID.screen] && data.data.streamID.hasOwnProperty('screen')) {
                    state.remoteStreams[data.data.streamID.screen] = data.data.streamID.screen;
                }
            }
            // Make RTC video answer
            if (media.includes('camera') && data.data.offer.hasOwnProperty('camera')) {
                state.showing = true;
                await state.peerConnections[data.data.from]['pc']['video']['remote'].setRemoteDescription(
                    new RTCSessionDescription(data.data.offer.camera)
                );
                answer['camera'] = await state.peerConnections[data.data.from]['pc']['video']['remote'].createAnswer();
                await state.peerConnections[data.data.from]['pc']['video']['remote'].setLocalDescription(new RTCSessionDescription(answer['camera']));

                if (! state.remoteStreams[data.data.streamID.camera] && data.data.streamID.hasOwnProperty('camera')) {
                    state.remoteStreams[data.data.streamID.camera] = data.data.streamID.camera;
                }
            }
            // Make RTC audio answer
            if (media.includes('audio') && data.data.offer.hasOwnProperty('audio')) {
                await state.peerConnections[data.data.from]['pc']['audio']['remote'].setRemoteDescription(
                    new RTCSessionDescription(data.data.offer.audio)
                );
                answer['audio'] = await state.peerConnections[data.data.from]['pc']['audio']['remote'].createAnswer();
                await state.peerConnections[data.data.from]['pc']['audio']['remote'].setLocalDescription(new RTCSessionDescription(answer['audio']));

                if (! state.remoteStreams[data.data.streamID.audio] && data.data.streamID.hasOwnProperty('audio')) {
                    state.remoteStreams[data.data.streamID.audio] = data.data.streamID.audio;
                }
            }
            // Broadcast answers
            state.socket.emit('make-answer',{
                answer,
                to: data.data.from,
                media: data.data.media
            })
        }
    },
    async answerMade(context , data)  {
        const media = Object.values(data.data.media);
        let callbackMedia = [];
        let shared_status = {};

        if (media.length > 0) {
            if (media.includes('screen')) {
                await context.state.peerConnections[data.data.from]['pc']['screen'].setRemoteDescription(
                    new RTCSessionDescription(data.data.answer.screen)
                );
                shared_status['screen'] = 'screen_shared';
                if (! context.state.peerConnections[data.data.from][ shared_status['screen'] ]) {
                    context.state.peerConnections[data.data.from][ shared_status['screen'] ] = true;
                    callbackMedia.push('screen');
                }
            }

            if (media.includes('audio')) {
                await context.state.peerConnections[data.data.from]['pc']['audio']['local'].setRemoteDescription(
                    new RTCSessionDescription(data.data.answer.audio)
                );
                shared_status['audio'] = 'audio_shared';
                if (! context.state.peerConnections[data.data.from][ shared_status['audio'] ]) {
                    context.state.peerConnections[data.data.from][ shared_status['audio'] ] = true;
                    callbackMedia.push('audio');
                }
            }

            if (media.includes('camera')) {
                await context.state.peerConnections[data.data.from]['pc']['video']['local'].setRemoteDescription(
                    new RTCSessionDescription(data.data.answer.camera)
                );
                shared_status['camera'] = 'camera_shared';
                if (! context.state.peerConnections[data.data.from][ shared_status['camera'] ]) {
                    context.state.peerConnections[data.data.from][ shared_status['camera'] ] = true;
                    callbackMedia.push('camera');
                }
            }

            await context.dispatch('startStream',{
                from: context.state.socket.id,
                to: [data.data.from],
                media: callbackMedia
            });
        }
    },
    async sendShared({state , dispatch} , data) {
        const media = Object.values(data.data.media);
        let calls = [];

        if (media.length > 0) {
            if (state.videoStream && media.includes('camera') && state.peerConnections[data.data.from]['pc']['video']['local'].getSenders().length === 0 ) {
                state.videoStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc']['video']['local'].addTrack(track, state.videoStream));
                calls.push('camera');
            }

            if (state.localStream && media.includes('audio') && state.peerConnections[data.data.from]['pc']['audio']['local'].getSenders().length === 0  ) {
                state.localStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc']['audio']['local'].addTrack(track, state.localStream));
                calls.push('audio');
            }

            if (state.displayStream && media.includes('screen') && state.peerConnections[data.data.from]['pc']['screen'].getSenders().length === 0 ) {
                state.displayStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc']['screen'].addTrack(track, state.displayStream));
                calls.push('screen');
            }

            if (calls.length > 0) {
                dispatch('startStream',{
                    from: state.socket.id,
                    to: [data.data.from],
                    media: data.data.media
                })
            }
        }
    },
    endStream({state , commit} , data) {
        try {
            let streamID , videoStreamID;
            let media = Object.values(data.media);

            if (media.includes('audio')) {
                if (state.localStream) {
                    streamID = state.localStream.id;
                    state.localStream = null;
                }
                commit('controlMicrophone',false);
            }

            if (media.includes('camera')) {
                if (state.videoStream) {
                    videoStreamID = state.videoStream.id;
                    state.videoStream = null;
                }
                commit('controlCamera',false);
            }

            for (const id in state.peerConnections) {
                if (state.peerConnections[id]['pc']) {
                    if (media.includes('camera')) {
                        state.peerConnections[id]['camera_shared'] = false;
                    }

                    if (media.includes('audio')) {
                        state.peerConnections[id]['audio_shared'] = false;
                    }
                }
            }

            if (media.length > 0) {
                state.socket.emit('end-stream' , {
                    media,
                    streamID,
                    videoStreamID
                })
            }
        } catch (err) {
            console.log(err);
        }
    },
    endScreen({state}  , data) {
        if (state.displayStream) {
            const screenStreamID = state.displayStream.id;
            state.displayStream.getTracks().forEach(function(track) { track.stop(); })
            state.displayStream.getVideoTracks()[0].enabled = false;
            state.shareScreen = false;
            state.displayStream = null;
            for (const id in state.peerConnections) {
                if (state.peerConnections[id]['pc']) {
                    state.peerConnections[id]['screen_shared'] = false;
                }
            }
            state.socket.emit('end-stream' , {
                media: ['screen'],
                screenStreamID
            })
        }
    },
    clearRemoteStream(context , data){
        if (data.data.hasOwnProperty('camera') && data.data.camera) {
            context.state.showing = false;
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

                    devices.forEach((device,key) => {

                        if (device.kind === 'videoinput') {
                            if (! state.selectedVideoDevice) {
                                state.selectedVideoDevice = device.deviceId;
                            }
                            state.videoInputs.push({
                                label: device.label || 'unknown camera',
                                id: device.deviceId
                            });
                        } else if (device.kind === 'audioinput') {
                            if (! state.selectedAudioDevice) {
                                state.selectedAudioDevice = device.deviceId;
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

                    let foundCamera = false , foundAudio = false , media = [];

                    for( let i = 0; i < state.videoInputs.length; i++) {
                        if (state.audioInputs[i]?.id === state.selectedVideoDevice) {
                            foundCamera = true;
                            break;
                        }
                    }

                    if (! foundCamera && state.videoStream) {
                        state.selectedVideoDevice = null;
                        media.push('camera');
                    }

                    for( let i = 0; i < state.audioInputs.length; i++) {
                        if (state.audioInputs[i]?.id === state.selectedAudioDevice) {
                            foundAudio = true;
                            break;
                        }
                    }
                    if (! foundAudio && state.localStream) {
                        state.selectedAudioDevice = null;
                        media.push('audio');
                    }

                    dispatch('endStream',{
                        media
                    });

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
            if (state.videoStream) {
                dispatch('endStream',{
                    media: ['camera']
                });
            }
        } else if (value.type === 'microphone') {
            if (state.selectedAudioDevice !== value.value) {
                state.selectedAudioDevice = value.value;
                if (state.localStream) {
                    dispatch('endStream',{
                        media: ['audio']
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