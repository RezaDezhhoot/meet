import Swal from "sweetalert2";
const iceConfiguration = {
    iceServers: [
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
export const actions = {
    async addIceCandidate({state} , data) {
        for (const id in state.peerConnections) {
            if (state.peerConnections[id]['pc']) {
                try {
                    if (data.candidate) {
                        await state.peerConnections[id]['pc'][data.media].addIceCandidate(data.candidate)
                    }
                } catch (err) {
                    console.log(err , data)
                }
            }
        }
    },
    fillRTCs({state , dispatch} , data){
        const clients = data.clients
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
            state.peerConnections[id]['pc']['video'].ontrack = async function ({track , streams: [stream]}) {
                track.onunmute = () => {
                    state.remoteStreams['camera'][stream.id] = stream
                    dispatch('setDynamicGrid')
                }
            };
            state.peerConnections[id]['pc']['video'].onicecandidate = function (event) {
                if (event.candidate) {
                    state.socket.emit("send-candidate" , {
                        candidate: event.candidate,
                        media: "video"
                    })
                }
            }
            // Set remote audio stream
            state.peerConnections[id]['pc']['audio'].ontrack = async function (stream ) {
                if(stream.track.kind === 'audio') {
                    let audio = document.getElementById(stream.track.id);
                    let newAudio = false;
                    if (! audio) {
                        audio  = document.createElement('audio');
                        newAudio = true;
                        audio.autoplay = true;
                        audio.defaultMuted  = false;
                        audio.classList.add('hidden');
                        audio.id = stream.track.id;
                        audio.setAttribute("muted","true")
                        audio.srcObject = stream.streams[0];
                        audio.load();
                    } else {
                        audio.autoplay = true;
                        audio.defaultMuted  = false;
                        audio.classList.add('hidden');
                        audio.id = stream.track.id;
                        audio.muted = "muted";
                        audio.srcObject = stream.streams[0];
                        audio.load();
                    }

                    if (newAudio) {
                        document.getElementById('main').appendChild(audio);
                    }
                }
            };
            state.peerConnections[id]['pc']['audio'].onicecandidate = function (event) {
                if (event.candidate) {
                    state.socket.emit("send-candidate" , {
                        candidate: event.candidate,
                        media: "audio"
                    })
                }
            }
            // Set remote screen stream
            state.peerConnections[id]['pc']['screen'].ontrack = async function (stream) {
                document.getElementById('screen-player').srcObject = stream.streams[0];
            };
            state.peerConnections[id]['pc']['screen'].onicecandidate = function (event) {
                if (event.candidate) {
                    state.socket.emit("send-candidate" , {
                        candidate: event.candidate,
                        media: "screen"
                    })
                }
            }
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

        for (const id in state.peerConnections) {
            if(! Object.keys(clients).includes(id)) {
                delete state.peerConnections[id];
            }
        }

        if (state.displayStream) {
            dispatch('screenShare',{
                media: ['screen'],stream: state.displayStream
            });
        }

        if (state.localStream) {
            dispatch('audioShare',{
                media: ['audio'],stream: state.localStream
            });
        }

        // if (state.videoStream) {
        //     dispatch('videoShare',{
        //         media: ['camera'], localStream: state.videoStream
        //     });
        // }
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
    async screenShare(context , {media, stream}){
        let to = [];
        try {
            for (const id in context.state.peerConnections) {
                if (context.state.peerConnections[id]['pc']) {
                    context.state.displayStream.getTracks().forEach(track => {
                        track.shareing = true;
                        context.state.peerConnections[id]['pc']['screen'].addTrack(track,stream)
                    });
                    to.push(id);
                }
            }
        } catch (err) {}
        context.state.shareScreen = true;
        await context.dispatch('startStream',{from: context.state.socket.id,to ,media })
    },
    async audioShare(context , {media, stream}) {
        let to = [];
        context.state.socket.emit('control-local-media',{
            device: 'microphone',
            action: true
        });

        try {
            for (const id in context.state.peerConnections) {
                if (context.state.peerConnections[id]['pc']) {
                    context.state.localStream.getTracks().forEach(track => {
                        context.state.peerConnections[id]['pc']['audio'].addTrack(track,stream)
                    });
                    to.push(id);
                }
            }
        } catch (err) {}
        context.state.user.media.media.local.microphone = true;
        context.commit('controlMicrophone', context.state.user.media.media.local.microphone);
        await context.dispatch('startStream',{from: context.state.socket.id,to ,media })
    },
    async videoShare(context , {media, localStream}) {
        let to = [];
        context.state.socket.emit('control-local-media',{
            device: 'camera',
            action: true
        });
        try {
            for (const id in context.state.peerConnections) {
                if (context.state.peerConnections[id]['pc']) {
                    context.state.videoStream.getTracks().forEach(track => {
                        context.state.peerConnections[id]['pc']['video'].addTrack(track,localStream)
                    });
                    to.push(id);
                }
            }
        } catch (err) {}
        context.state.user.media.media.local.camera = true;
        context.commit('controlCameraLoader' , false);
        await context.dispatch('startStream',{from: context.state.socket.id,to ,media})
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
                media = 'screen';
                context.commit('controlMediaLoader');
                context.commit('setContent' , true)
                context.commit('setShareScreen' , true)
                await context.dispatch('screenShare',{stream ,media: [media] })
            }).catch(function (err) {
                context.commit('setContent' , false)
                context.commit('setShareScreen' , false)
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
                context.state.remoteStreams['camera'][localStream.id] = localStream
                context.dispatch('setDynamicGrid')
                await context.dispatch('videoShare',{media: [media],localStream: stream  });
            }).catch(function (err) {
                console.log(err)
                context.commit('controlCameraLoader' , false);
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

            //
            try {
                const stream = context.state.recorderLocalStream ? context.state.recorderLocalStream : await navigator.mediaDevices.getUserMedia(constraints)
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

                context.state.localStream = audioDest.stream;
                media = 'audio';
                await context.dispatch('audioShare',{media: [media], stream })
            } catch (err) {
                let text = 'عدم دسترسی به میکروفون!';
                await Swal.fire({
                    position: 'top-start',
                    text,
                    icon: 'warning',
                    showConfirmButton: false,
                    backdrop: false,
                    timer: 3500,
                })
            }
        }
    },
    async startStream({state , dispatch} , data) {
        const media = Object.values(data.media);
        let offer = {} , streamID = {};
        if (media.includes('screen') && state.displayStream ) {
            if (! state.remoteStreams['screen'] ) {
                state.remoteStreams['screen'] = {}
            }
            streamID['screen'] = state.displayStream.id;
        }

        if (media.includes('audio') && state.localStream) {
            if (! state.remoteStreams['audio'] ) {
                state.remoteStreams['audio'] = {}
            }
            streamID['audio'] = state.localStream.id;
        }

        if (media.includes('camera') && state.videoStream) {
            if (! state.remoteStreams['camera'] ) {
                state.remoteStreams['camera'] = {}
            }
            streamID['camera'] = state.videoStream.id;
        }

        if (media.length > 0) {
            if (data.to.length > 0) {
                for (const v of data.to) {
                    // Make RTC screen offer
                    if (media.includes('screen') && state.displayStream ) {
                        offer['screen'] = await state.peerConnections[v]['pc']['screen'].createOffer();
                        streamID['screen'] = state.displayStream.id;
                        state.remoteStreams['screen'][data.from] = streamID['screen'];
                        await state.peerConnections[v]['pc']['screen'].setLocalDescription(new RTCSessionDescription(offer['screen']));
                    }
                    // Make RTC audio offer
                    if (media.includes('audio') && state.localStream) {
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
        console.log(data.data)


        if (state.peerConnections[data.data.from] && state.peerConnections[data.data.from]['pc'] && media.length > 0) {
            // Make RTC screen answer
            if (media.includes('screen') && data.data.offer.hasOwnProperty('screen')) {
                try {
                    commit('controlMediaLoader');
                    await state.peerConnections[data.data.from]['pc']['screen'].setRemoteDescription(
                        new RTCSessionDescription(data.data.offer.screen)
                    );
                    answer['screen'] = await state.peerConnections[data.data.from]['pc']['screen'].createAnswer();
                    await state.peerConnections[data.data.from]['pc']['screen'].setLocalDescription(new RTCSessionDescription(answer['screen']));
                    commit('setContent' , true);
                    commit('setShareScreen' , true);

                    if (! state.remoteStreams['screen'] ) {
                        state.remoteStreams['screen'] = {}
                    }

                    if (data.data.streamID.hasOwnProperty('screen')) {
                        state.remoteStreams['screen'][data.data.from] = data.data.streamID['screen'];
                    }
                } catch (err) {
                    console.log(err)
                }
            }
            // Make RTC video answer
            if (media.includes('camera') && data.data.offer.hasOwnProperty('camera')) {
               try {
                   commit('controlCameraLoader');

                   await state.peerConnections[data.data.from]['pc']['video'].setRemoteDescription(
                       new RTCSessionDescription(data.data.offer.camera)
                   );

                   answer['camera'] = await state.peerConnections[data.data.from]['pc']['video'].createAnswer();
                   await state.peerConnections[data.data.from]['pc']['video'].setLocalDescription(new RTCSessionDescription(answer['camera']));

                   if (! state.remoteStreams['camera'] ) {
                       state.remoteStreams['camera'] = {}
                   }

                   console.log(1)
                   // if (data.data.streamID.hasOwnProperty('camera')) {
                   //     state.remoteStreams['camera'][data.data.from] = data.data.streamID['camera'];
                   // }

                   commit('controlCameraLoader',false);
               } catch (err) {
                   console.log(err)
               }
                // dispatch('updateVideoGrid');
            }
            // Make RTC audio answer
            if (media.includes('audio') && data.data.offer.hasOwnProperty('audio')) {
              try {
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
                  commit('controlSound' , {
                      value: state.sound
                  })
              } catch (err) {
                  console.log(err)
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
               try {
                   await context.state.peerConnections[data.data.from]['pc']['screen'].setRemoteDescription(
                       new RTCSessionDescription(data.data.answer.screen)
                   );
               } catch (err) {
                   console.log(err)
               }
                context.commit('controlMediaLoader',false);

                if (! context.state.peerConnections[data.data.from]['pc']['screen_shared']) {
                    callbacks.push('screen');
                    context.state.peerConnections[data.data.from]['pc']['screen_shared'] = true;
                }
            }

            if (media.includes('audio')) {
                try {
                    await context.state.peerConnections[data.data.from]['pc']['audio'].setRemoteDescription(
                        new RTCSessionDescription(data.data.answer.audio)
                    );
                } catch (err) {
                    console.log(err)
                }
                if (! context.state.peerConnections[data.data.from]['pc']['audio_shared']) {
                    callbacks.push('audio');
                    context.state.peerConnections[data.data.from]['pc']['audio_shared'] = true;
                }
            }

            if (media.includes('camera')) {
                try {
                    await context.state.peerConnections[data.data.from]['pc']['video'].setRemoteDescription(
                        new RTCSessionDescription(data.data.answer.camera)
                    );
                } catch (err) {
                    console.log(err)
                }
                context.commit('controlCameraLoader',false);

                if (! context.state.peerConnections[data.data.from]['pc']['camera_shared']) {
                    callbacks.push('camera');
                    context.state.peerConnections[data.data.from]['pc']['camera_shared'] = true;
                }
            }

            if (callbacks.length > 0) {
                // await context.dispatch('startStream', {
                //     media: data.data.media,
                //     from: context.state.socket.id,
                //     to:[data.data.from]
                // })
                if (media.includes("audio")) {
                    context.state.socket.emit("check-speakers")
                }
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
            } else if (state.shareFile) {
                state.socket.emit('get-shared-file' , {
                    file: state.shareFile,
                    to: data.data.from
                })
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
                    state.localStream.getTracks().forEach(function(track) { track.stop(); })
                    state.localStream = null;
                }
                commit('controlMicrophone',false);
            }
            let camera
            if (media.includes('camera')) {
                if (state.videoStream) {
                    camera = state.videoStream.id
                    state.videoStream.getTracks().forEach(function(track) { track.stop(); })
                    state.videoStream = null;
                }
                commit('controlCamera',false);
                commit('controlCameraLoader',false);
            }

            if (media.length > 0) {
                state.socket.emit('end-stream' , {
                    media,
                    camera
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
        }
        state.socket.emit('end-stream' , {
            media: ['screen'],
        })
        commit('setContent' , false)
        commit('setShareScreen' , false)
        commit('setShareFile' , false)
        commit('controlMediaLoader',false);
    },
    clearRemoteStream(context , data){
        let el;
        if (data.data.hasOwnProperty('camera') && data.data.camera) {
            context.state.showing = false;
            context.commit('controlCameraLoader',false);
            delete context.state.remoteStreams['camera'][data.data.camera];
            context.dispatch('setDynamicGrid');
        }
        if (data.data.from !== context.state.socket.id) {
            if (data.data.hasOwnProperty('screen') && data.data.screen ) {
                context.state.shareScreen = false;
                context.commit('controlMediaLoader',false);
                context.commit('setContent' , false)
                context.commit('setShareScreen' , false)
                context.commit('setShareFile' , false)
            }
            if (data.data.hasOwnProperty('audio') && data.data.audio ) {
                context.commit('controlMediaLoader',false);
                if (context.state.remoteStreams['audio'].hasOwnProperty(data.data.from)) {
                    el = document.getElementById(context.state.remoteStreams['audio'][data.data.from]);
                    if (el) {
                        el.remove();
                    }
                    el = null;
                    delete context.state.remoteStreams['audio'][data.data.from];
                }
            }
        }
    },
    async setDevices({state,dispatch}) {
        // try {
        //     let stream = await navigator.mediaDevices.getUserMedia({
        //         video: true,
        //         audio: true,
        //     });
        //     stream.getTracks().forEach(function (track) {
        //         track.stop()
        //     })
        //     stream = null
        // } catch (error) {
        //     console.error('Permission denied or error occurred:', error);
        // }
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
    },
    shareFile({state} , data) {
        state.socket.emit("share-file", data);
    },
    getSharedFile({state , commit} , data) {
        const iframeContainer = document.getElementById("iframeContainer");
        iframeContainer.innerHTML = "";
        if (data.mime === "application/pdf") {
            const embed = document.createElement("object");
            embed.data  = data.url;
            embed.style.width = "100%";
            embed.style.height = "100%";
            embed.style.border = "none";
            iframeContainer.appendChild(embed);
        } else if (data.mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || data.mime === "application/vnd.ms-powerpoint") {
            const embed = document.createElement("object");
            embed.data  = `https://docs.google.com/gview?url=${data.url}&embedded=true`;
            embed.style.width = "100%";
            embed.style.height = "100%";
            embed.style.border = "none";
            iframeContainer.appendChild(embed);
        } else {
            const img = document.createElement("img");
            img.src = data.url;
            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            img.style.border = "none";
            iframeContainer.appendChild(img);
        }
        commit("setContent" , true)
        commit("setShareFile" , data)
    },
    setDynamicGrid({state , commit}) {
        const streams = Object.entries(state.remoteStreams['camera'] ?? {})
        const boxCount = streams.length
        const outerBox = document.querySelector('.outer-box');
        if (boxCount > 0) {
            outerBox.innerHTML = '';
            let columns = Math.ceil(Math.sqrt(boxCount));
            let rows = Math.ceil(boxCount / columns);
            let columnWidth = 100 / columns;
            let rowHeight = 100 / rows;
            outerBox.style.gridTemplateColumns = `repeat(${columns}, ${columnWidth}%)`;
            outerBox.style.gridTemplateRows = `repeat(${rows}, ${rowHeight}%)`;
            for (const [key , value] of streams) {
                const box = document.createElement('div')
                box.id = key;
                box.className = 'inner-box';
                const video = document.createElement('video')
                video.srcObject = value;
                video.muted = true;
                video.autoplay = true;
                video.playsinline = true;
                box.appendChild(video)
                outerBox.appendChild(box);
            }
        } else {
            outerBox.innerHTML = '';
            state.remoteStreams['camera'] = {}
        }
    },
}