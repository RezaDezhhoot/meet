import Swal from "sweetalert2";
export const actions = {
    async addIceCandidate({state} , data) {
        for (const id in state.peerConnections) {
            if (state.peerConnections[id]['pc']) {
                if (data.data.candidate) {
                    await state.peerConnections[id]['pc'][data.data.media].addIceCandidate(data.data.candidate)
                }
            }
        }
    },
    fillRTCs({state , dispatch} , data){
        const clients = data.clients
        const iceConfiguration = {
            iceServers: [
                {
                    urls: `turn:${import.meta.env.VITE_ICE_SERVER_URL}`,
                    username: import.meta.env.VITE_ICE_SERVER_USERNAME,
                    credential: import.meta.env.VITE_ICE_SERVER_PASSWORD
                },
                {
                    urls: `stun:${import.meta.env.VITE_ICE_SERVER_URL}`,
                    username: import.meta.env.VITE_ICE_SERVER_USERNAME,
                    credential: import.meta.env.VITE_ICE_SERVER_PASSWORD
                },
                {
                    "url": "stun:stun2.1.google.com:19302"
                }
            ]
        }
        // Creating RTC connection for each user to local
        function makeNewPc(id , user_id) {
            state.peerConnections[id] = {
                user_id,
                pc: {
                    // Audio RTC peer connection
                    audio: new RTCPeerConnection(iceConfiguration),
                    // Video RTC peer connection
                    video: new RTCPeerConnection(iceConfiguration),
                    // Screen RTC peer connection
                    screen: new RTCPeerConnection(iceConfiguration)
                }
            }
            // Set remote video stream
            state.peerConnections[id]['pc']['video'].ontrack = async function (stream) {
                if (stream.track.kind === 'video') {
                    const parent = document.getElementById('video-grid-container')
                    const div  = document.createElement('div');
                    div.id = stream.streams[0].id;
                    div.classList.add("grid-item")

                    const video = document.createElement('video')
                    video.srcObject = stream.streams[0];
                    video.muted = true;
                    video.autoplay = true;
                    video.playsinline = true;
                    video.classList.add("h-full","w-full");
                    video.load();

                    parent.appendChild(div);
                    div.appendChild(video);
                }
            };
            // Set remote audio stream
            state.peerConnections[id]['pc']['audio'].ontrack = async function (stream) {
                if(stream.track.kind === 'audio') {
                    const audio = document.createElement('audio');
                    audio.autoplay = true;
                    audio.classList.add('hidden');
                    audio.id = stream.streams[0].id;
                    audio.muted = false;
                    audio.srcObject = stream.streams[0];
                    audio.load();
                    document.getElementById('main').appendChild(audio);
                }
            };
            // Set remote screen stream
            state.peerConnections[id]['pc']['screen'].ontrack = async function (stream) {
                document.getElementById('screen-player').srcObject = stream.streams[0];
            };
        }
        if (data.from === state.socket.id) {
            for (const index in clients) {
                if (state.user && state.user.hasOwnProperty('user') && index !== state.socket.id) {
                    if ( ! state.peerConnections[index] || ! state.peerConnections[index]['pc'] ) {
                        makeNewPc(index,clients[index].user.id);
                    }
                    // If the user has started a stream, it joins the old stream
                    dispatch('joinStream',clients[index]);
                }
            }
        } else {
            makeNewPc(data.from,clients[data.from].user.id)
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
                context.commit('controlMediaLoader');
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
                context.commit('controlMediaLoader' , false);
                Swal.fire({
                    position: 'top-start',
                    text: "مشکلی در عملیات اشتراک گذاری رخ داده است!",
                    icon: 'warning',
                    showConfirmButton: false,
                    backdrop: false,
                    timer: 3500,
                })
            });
        }
        else if (data.media === 'camera') {
            constraints = {
                video: data.video ? ( {deviceId: context.state.selectedVideoDevice ? {exact: context.state.selectedVideoDevice} : undefined} ) : false,
                audio: false,
            };

            navigator.mediaDevices.getUserMedia(constraints).then(async function (stream) {
                context.commit('controlCameraLoader');
                const localStream = stream;
                context.state.videoStream = localStream;
                context.state.showing = true;
                media = 'camera';
                context.state.socket.emit('control-local-media',{
                    device: 'camera',
                    action: true
                });

                if (! context.state.remoteStreams['camera'] ) {
                    context.state.remoteStreams['camera'] = {}
                }
                context.state.remoteStreams['camera'][context.state.socket.id] = stream.id;
                await context.dispatch('updateVideoGrid');

                const parent = document.getElementById('video-grid-container')
                const div  = document.createElement('div');
                div.id = stream.id;
                div.classList.add("grid-item")
                const video = document.createElement('video')
                video.srcObject = stream;
                video.muted = "muted";
                video.autoplay = "1";
                video.classList.add("h-full","w-full");
                video.load();

                parent.appendChild(div);
                div.appendChild(video);
                if (! context.state.remoteStreams['camera'] ) {
                    context.state.remoteStreams['camera'] = {}
                }
                context.state.remoteStreams['camera'][context.state.socket.id] = stream.id;
                await context.dispatch('updateVideoGrid');

                for (const id in context.state.peerConnections) {
                    if (context.state.peerConnections[id]['pc']) {
                        context.state.videoStream.getTracks().forEach(track => {
                            context.state.peerConnections[id]['pc']['video'].addTrack(track,localStream)
                        });
                        to.push(id);
                    }
                }
            }).then(async () => {
                await context.dispatch('startStream',{from: context.state.socket.id,to ,media: [media] })
                context.commit('controlCameraLoader' , false);
            }).catch(function (err) {
                console.log(err);
                context.commit('controlCameraLoader' , false);
                context.dispatch('setDevices');
                Swal.fire({
                    position: 'top-start',
                    text: "عدم دسترسی به دوربین!",
                    icon: 'warning',
                    showConfirmButton: false,
                    backdrop: false,
                    timer: 3500,
                })
            });
        } else {
            constraints = {
                video: false,
                audio: data.audio ? ( {
                    aspectRatio: true,
                    deviceId: context.state.selectedAudioDevice ? {exact: context.state.selectedAudioDevice} : undefined ,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    googNoiseSuppression: true,
                    googHighpassFilter: true,
                    googTypingNoiseDetection: true,
                    googNoiseReduction: true,
                    volume: 1.0,
                    googEchoCancellation: true,
                    googAutoGainControl: true,
                } ) : false,
            };

            navigator.mediaDevices.getUserMedia(constraints).then(async function (stream) {
                const ctx = new AudioContext();
                const gainNode = ctx.createGain();
                const sinWave = ctx.createOscillator();

                const audioDest = ctx.createMediaStreamDestination();
                const source = ctx.createMediaStreamSource(stream);


                // gainNode is set to 0.5
                sinWave.connect(gainNode);
                gainNode.connect(audioDest);
                gainNode.gain.value = 0.5;
                source.connect(gainNode);

                const localStream = audioDest.stream;
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
                            context.state.peerConnections[id]['pc']['audio'].addTrack(track,localStream)
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
                let text = 'عدم دسترسی به میکروفون!';

                Swal.fire({
                    position: 'top-start',
                    text,
                    icon: 'warning',
                    showConfirmButton: false,
                    backdrop: false,
                    timer: 3500,
                })
            });
        }
    },
    async startStream({state , dispatch} , data) {
        const media = Object.values(data.media);
        let offer = {} , streamID = {};
        if (media.length > 0) {
            if (data.to.length > 0) {
                for (const v of data.to) {
                    // Make RTC screen offer
                    if (media.includes('screen') && state.displayStream) {
                        if (! state.remoteStreams['screen'] ) {
                            state.remoteStreams['screen'] = {}
                        }
                        offer['screen'] = await state.peerConnections[v]['pc']['screen'].createOffer();
                        streamID['screen'] = state.displayStream.id;
                        state.remoteStreams['screen'][data.from] = streamID['screen'];
                        await state.peerConnections[v]['pc']['screen'].setLocalDescription(new RTCSessionDescription(offer['screen']));
                    }
                    // Make RTC audio offer
                    if (media.includes('audio') && state.localStream) {
                        if (! state.remoteStreams['audio'] ) {
                            state.remoteStreams['audio'] = {}
                        }
                        offer['audio'] = await state.peerConnections[v]['pc']['audio'].createOffer();
                        streamID['audio'] = state.localStream.id;
                        state.remoteStreams['audio'][data.from] = streamID['audio'];
                        await state.peerConnections[v]['pc']['audio'].setLocalDescription(new RTCSessionDescription(offer['audio']));
                    }
                    // Make RTC video offer
                    if (media.includes('camera') && state.videoStream) {
                        offer['camera'] = await state.peerConnections[v]['pc']['video'].createOffer();
                        streamID['camera'] = state.videoStream.id;
                        await state.peerConnections[v]['pc']['video'].setLocalDescription(new RTCSessionDescription(offer['camera']));
                    }

                    state.socket.emit("share-stream", {
                        offer,
                        from: data.from,
                        to: [v],
                        media: data.media,
                        streamID
                    });
                }
            } else {
                state.socket.emit("share-stream", {
                    offer,
                    from: data.from,
                    to: [],
                    media: data.media,
                    streamID
                });
            }
        }
    },
    async getOffer({state , commit , dispatch} , data) {
        const media = Object.values(data.data.media);
        let answer = {};

        if (state.peerConnections[data.data.from] && state.peerConnections[data.data.from]['pc'] && media.length > 0) {
            // Make RTC screen answer
            if (media.includes('screen') && data.data.offer.hasOwnProperty('screen')) {
                commit('controlMediaLoader');
                await state.peerConnections[data.data.from]['pc']['screen'].setRemoteDescription(
                    new RTCSessionDescription(data.data.offer.screen)
                );
                answer['screen'] = await state.peerConnections[data.data.from]['pc']['screen'].createAnswer();
                await state.peerConnections[data.data.from]['pc']['screen'].setLocalDescription(new RTCSessionDescription(answer['screen']));
                state.shareScreen = true;

                if (! state.remoteStreams['screen'] ) {
                    state.remoteStreams['screen'] = {}
                }

                if (data.data.streamID.hasOwnProperty('screen')) {
                    state.remoteStreams['screen'][data.data.from] = data.data.streamID['screen'];
                }
            }
            // Make RTC video answer
            if (media.includes('camera') && data.data.offer.hasOwnProperty('camera')) {
                commit('controlCameraLoader');
                await state.peerConnections[data.data.from]['pc']['video'].setRemoteDescription(
                    new RTCSessionDescription(data.data.offer.camera)
                );

                answer['camera'] = await state.peerConnections[data.data.from]['pc']['video'].createAnswer();
                await state.peerConnections[data.data.from]['pc']['video'].setLocalDescription(new RTCSessionDescription(answer['camera']));

                if (! state.remoteStreams['camera'] ) {
                    state.remoteStreams['camera'] = {}
                }

                if (data.data.streamID.hasOwnProperty('camera')) {
                    state.remoteStreams['camera'][data.data.from] = data.data.streamID['camera'];
                }

                commit('controlCameraLoader',false);
                dispatch('updateVideoGrid');
            }
            // Make RTC audio answer
            if (media.includes('audio') && data.data.offer.hasOwnProperty('audio')) {
                await state.peerConnections[data.data.from]['pc']['audio'].setRemoteDescription(
                    new RTCSessionDescription(data.data.offer.audio)
                );
                answer['audio'] = await state.peerConnections[data.data.from]['pc']['audio'].createAnswer();
                await state.peerConnections[data.data.from]['pc']['audio'].setLocalDescription(new RTCSessionDescription(answer['audio']));

                if (! state.remoteStreams['audio'] ) {
                    state.remoteStreams['audio'] = {}
                }

                if (data.data.streamID.hasOwnProperty('audio')) {
                    state.remoteStreams['audio'][data.data.from] = data.data.streamID['audio'];
                }
                commit("controlSound",{
                    value: state.sound
                })

                if (state.sound) {
                    const mediaPlayers = document.querySelectorAll('audio');
                    Array.from(mediaPlayers).forEach(el => {
                        el.muted = false;
                    })
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
        let callbacks = [];

        if (media.length > 0) {
            if (media.includes('screen')) {
                await context.state.peerConnections[data.data.from]['pc']['screen'].setRemoteDescription(
                    new RTCSessionDescription(data.data.answer.screen)
                );
                context.commit('controlMediaLoader',false);

                if (! context.state.peerConnections[data.data.from]['pc']['screen_shared']) {
                    callbacks.push('screen');
                    context.state.peerConnections[data.data.from]['pc']['screen_shared'] = true;
                }
            }

            if (media.includes('audio')) {
                await context.state.peerConnections[data.data.from]['pc']['audio'].setRemoteDescription(
                    new RTCSessionDescription(data.data.answer.audio)
                );
                if (! context.state.peerConnections[data.data.from]['pc']['audio_shared']) {
                    callbacks.push('audio');
                    context.state.peerConnections[data.data.from]['pc']['audio_shared'] = true;
                }
            }

            if (media.includes('camera')) {
                await context.state.peerConnections[data.data.from]['pc']['video'].setRemoteDescription(
                    new RTCSessionDescription(data.data.answer.camera)
                );
                context.commit('controlCameraLoader',false);

                if (! context.state.peerConnections[data.data.from]['pc']['camera_shared']) {
                    callbacks.push('camera');
                    context.state.peerConnections[data.data.from]['pc']['camera_shared'] = true;
                }
            }

            console.log('ok');

            if (callbacks.length > 0) {
                await context.dispatch('startStream', {
                    media: data.data.media,
                    from: context.state.socket.id,
                    to:[data.data.from]
                })
            }

        }
    },
    async sendShared({state , dispatch} , data) {
        const media = Object.values(data.data.media);
        let calls = [];

        if (media.length > 0) {
            if (state.videoStream && media.includes('camera') && state.peerConnections[data.data.from]['pc']['video'].getSenders().length === 0 ) {
                state.videoStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc']['video'].addTrack(track, state.videoStream));
                calls.push('camera');
            }

            if (state.localStream && media.includes('audio') && state.peerConnections[data.data.from]['pc']['audio'].getSenders().length === 0  ) {
                state.localStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc']['audio'].addTrack(track, state.localStream));
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
            let media = Object.values(data.media);

            if (media.includes('audio')) {
                if (state.localStream) {
                    state.localStream = null;
                }
                commit('controlMicrophone',false);
            }

            if (media.includes('camera')) {
                if (state.videoStream) {
                    state.videoStream = null;
                }
                commit('controlCamera',false);
                commit('controlCameraLoader',false);
            }

            if (media.length > 0) {
                state.socket.emit('end-stream' , {
                    media,
                })
            }
        } catch (err) {
            console.log(err);
        }
    },
    endScreen({state , commit}  , data) {
        if (state.displayStream) {
            state.displayStream.getTracks().forEach(function(track) { track.stop(); })
            state.shareScreen = false;
            state.displayStream = null;
            state.socket.emit('end-stream' , {
                media: ['screen'],
            })
            commit('controlMediaLoader',false);
        }
    },
    clearRemoteStream(context , data){
        let el;
        if (data.data.hasOwnProperty('camera') && data.data.camera) {
            context.state.showing = false;
            context.commit('controlCameraLoader',false);
            if (context.state.remoteStreams['camera'] && context.state.remoteStreams['camera'].hasOwnProperty(data.data.from)) {
                el = document.getElementById(context.state.remoteStreams['camera'][data.data.from]);
                if (el) {
                    el.remove();
                }
                el = null;
                delete context.state.remoteStreams['camera'][data.data.from];
            }
            context.dispatch('updateVideoGrid');
        }


        if (data.data.from !== context.state.socket.id) {
            if (data.data.hasOwnProperty('screen') && data.data.screen ) {
                context.state.shareScreen = false;
                context.commit('controlMediaLoader',false);
            }
            if (data.data.hasOwnProperty('audio') && data.data.audio ) {
                context.commit('controlMediaLoader',false);
                el = document.getElementById(context.state.remoteStreams['audio'][data.data.from]);
                if (el) {
                    el.remove();
                }
                el = null;
                delete context.state.remoteStreams['audio'][data.data.from];
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
                                label: device.label || 'Unknown camera',
                                id: device.deviceId
                            });
                        } else if (device.kind === 'audioinput') {
                            if (! state.selectedAudioDevice) {
                                state.selectedAudioDevice = device.deviceId;
                            }
                            state.audioInputs.push({
                                label: device.label || 'Unknown microphone',
                                id: device.deviceId
                            });
                        } else if (device.kind === 'audiooutput') {
                            state.speakers.push({
                                label: device.label || 'Unknown speaker',
                                id: device.deviceId
                            });
                        }
                    });
                    let foundCamera = false , foundAudio = false , media = [];
                    for( let i = 0; i < state.videoInputs.length; i++) {
                        if (state.videoInputs[i]?.id === state.selectedVideoDevice) {
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
        updateDevice();
    },
    setDefaultDevice({state,dispatch} , value){
        if (value.type === 'camera') {
            state.selectedVideoDevice = value.value;
            if (state.videoStream) {
                dispatch('endStream',{
                    media: ['camera']
                });
                dispatch('shareStream',{
                    video: true , audio: false , media: 'camera'
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
    updateVideoGrid({state}){
        let itemCount = Object.entries(state.remoteStreams['camera'] ?? {}).length;
        const video_grid = document.getElementById('video-grid-container');


        if (itemCount === 0) {
            state.remoteStreams['camera'] = {};
            document.getElementById('video-empty').classList.remove('hidden');
            document.getElementById('video-grid').classList.add('hidden');
            document.getElementById('video-grid-container').innerHTML = null;
            return;
        } else {
            document.getElementById('video-empty').classList.add('hidden');
            document.getElementById('video-grid').classList.remove('hidden');
        }

        const top = Math.ceil(itemCount / 10);
        const cols =  itemCount === 2 ? 2 : Math.ceil( (itemCount / (top+1)) );
        const rows = Math.ceil(itemCount / cols);
        const cols_percent = 100 / cols;
        const rows_percent = 100 / rows;
        let row = "" , col = "";
        for (let  i = 1;i<= rows; i++){
            row += `${rows_percent}% `;
        }
        for (let  i = 1;i<= cols; i++){
            col += `${cols_percent}% `;
        }
        video_grid.style.gridTemplateColumns = col.trim();
        video_grid.style.gridTemplateRows = row.trim();
    }
}