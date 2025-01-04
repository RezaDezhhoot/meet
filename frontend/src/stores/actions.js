import Swal from "sweetalert2";
import RTCConnection from "../services/RTCConnection";
const iceConfiguration = {
    iceServers: [
        {
            urls: import.meta.env.VITE_ICE_SERVER_URL,
            username: import.meta.env.VITE_ICE_SERVER_USERNAME,
            credential: import.meta.env.VITE_ICE_SERVER_PASSWORD
        },
    ],
    iceCandidatePoolSize: 0,
    // iceTransportPolicy: "relay",
}
const WebRTC = new RTCConnection(iceConfiguration)

export const actions = {
    async addSenderIceCandidate({state} , {media , from , candidate}) {
        const types = WebRTC.getTypes()
        let conn
        switch (media) {
            case types.camera:
                conn = WebRTC.findCameraSenderConnection(from)
                break;
            case types.screen:
                conn = WebRTC.findScreenSenderConnection(from)
                break;
            case types.audio:
                conn = WebRTC.findAudioSenderConnection(from)
                break;
        }
        if (! conn) return
        conn.addIceCandidate(candidate)
    },
    async addReceiverIceCandidate({state} , {media , from , candidate}) {
        const types = WebRTC.getTypes()
        let conn
        switch (media) {
            case types.camera:
                conn = WebRTC.findCameraReceiverConnection(from)
                break;
            case types.screen:
                conn = WebRTC.findScreenReceiverConnection(from)
                break;
            case types.audio:
                conn = WebRTC.findAudioReceiverConnection(from)
                break;
        }
        if (! conn) return
        conn.addIceCandidate(candidate)
    },
    async screenShare(context){
        context.state.shareScreen = true;
        context.commit('setContent' , true);
        context.commit('setShareScreen' , true);
        context.commit('controlScreenLoader' , false);
        context.state.remoteStreams['screen'][context.state.displayStream.id] = context.state.displayStream
        await context.dispatch('updateShareScreen')
        await context.dispatch('startStream',{from: context.state.socket.id,to: context.state.clients ,media: ['screen'] ,firstTime: true})
    },
    async audioShare(context ) {
        context.state.socket.emit('control-local-media',{
            device: 'microphone',
            action: true
        });
        context.state.user.media.media.local.microphone = true;
        await context.dispatch('startStream',{from: context.state.socket.id,to:context.state.clients ,media: ['audio'],firstTime: true })
    },
    async videoShare({state , dispatch , commit}) {
        state.socket.emit('control-local-media',{
            device: 'camera',
            action: true
        });
        state.user.media.media.local.camera = true;
        state.remoteStreams['camera'][state.videoStream.id] = {
            stream: state.videoStream, name: state?.user?.user?.name + '(شما) '
        }
        commit('controlCameraLoader');
        await dispatch('setDynamicGrid')
        await dispatch('startStream',{from: state.socket.id,to: state.clients ,media: ['camera'],firstTime: true})
    },
    async shareStream(context , data) {
        let constraints;
        if (data === 'screen') {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: false}).then(async function(stream){
                stream.getVideoTracks()[0].onended = function () {
                    context.dispatch('endStream',{
                        media: ['screen']
                    })
                };
                context.state.displayStream = stream;
                await context.dispatch('screenShare')
            }).catch(function (err) {
                console.log(err)
                context.commit('setContent' , false)
                context.commit('setShareScreen' , false)
                context.commit('controlScreenLoader' , false);
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
                video: {
                    width: { ideal: 320  },
                    height: { ideal: 280 },
                    aspectRatio: { max: 4 / 3 },
                    frameRate: { max: 15 },
                    deviceId: context.state.selectedVideoDevice ? {exact: context.state.selectedVideoDevice} : undefined,
                },
                audio: false,
            };
            navigator.mediaDevices.getUserMedia(constraints).then(async function (stream) {
                context.state.videoStream = stream;
                await context.dispatch('videoShare');
            }).catch(function (err) {
                Swal.fire({
                    position: 'top-start',
                    text: "عدم دسترسی به دوربین!",
                    icon: 'warning',
                    showConfirmButton: false,
                    backdrop: false,
                    timer: 3500,
                })
            });
        }
        else {
            constraints = {
                video: false,
                audio:  {
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
                }
            }

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
                gainNode.gain.value = 0.75;
                source.connect(gainNode);
                context.state.localStream = audioDest.stream;
                await context.dispatch('audioShare')
            } catch (err) {
                console.log(err)

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
    async startStream({state , dispatch , commit} , {media , to , from , firstTime = false}) {
        if (media.length === 0) return
        to = Object.values(to);
        let offer = {} , streamID = {};
        if (media.includes('screen') && state.displayStream)
            streamID['screen'] = state.displayStream.id;
        if (media.includes('audio') && state.localStream)
            streamID['audio'] = state.localStream.id;
        if (media.includes('camera') && state.videoStream)
            streamID['camera'] = state.videoStream.id;
        if (to.length > 0) {
            for (const user of to) {
                if (user.socketId === from) continue
                if (media.includes('camera') && state.videoStream) {
                    const conn = WebRTC.newCameraSenderConnection(
                        user.socketId,
                        () => {
                            console.log('1 ice', conn.getICEState())
                        },
                        (e) => {
                            if (e.candidate) {
                                state.socket.emit("send-receiver-candidate" , {
                                    candidate: e.candidate,
                                    media: WebRTC.getTypes().camera,
                                    to: user.socketId
                                })
                            }
                        },
                        async () => {
                            switch (conn.getState()) {
                                case "failed": {
                                    WebRTC.clearSenderCameraConnections(from)
                                    dispatch("startStream" , {
                                        media: ['camera'],
                                        to: [user],
                                        from
                                    })
                                }
                            }
                            console.log('1 ', conn.getState())
                        }
                    )
                    state.videoStream.getTracks().forEach(track => conn.addTrack(track,state.videoStream));
                    offer['camera'] = await conn.makeOffer(true , false , true);
                }
                if (media.includes('screen') && state.displayStream ) {
                    const conn = WebRTC.newScreenSenderConnection(
                        user.socketId,
                        () => {
                            console.log('1 ice', conn.getICEState())
                        },
                        (e) => {
                            if (e.candidate) {
                                state.socket.emit("send-receiver-candidate" , {
                                    candidate: e.candidate,
                                    media: WebRTC.getTypes().screen,
                                    to: user.socketId
                                })
                            }
                        },
                        () => {
                            switch (conn.getState()) {
                                case "failed": {
                                    WebRTC.clearSenderScreenConnection(from)
                                    dispatch("startStream" , {
                                        media: ['screen'],
                                        to: [user],
                                        from
                                    })
                                }
                            }
                            // hande failed to reconnect
                            console.log('1 ', conn.getState())
                        }
                    )
                    state.displayStream.getTracks().forEach(track => conn.addTrack(track,state.displayStream));
                    offer['screen'] = await conn.makeOffer(true , false , true);
                }
                if (media.includes('audio') && state.localStream) {
                    const conn = WebRTC.newAudioSenderConnection(
                        user.socketId,
                        () => {
                            console.log('1 ice', conn.getICEState())
                        },
                        (e) => {
                            if (e.candidate) {
                                state.socket.emit("send-receiver-candidate" , {
                                    candidate: e.candidate,
                                    media: WebRTC.getTypes().audio,
                                    to: user.socketId
                                })
                            }
                        },
                        () => {
                            switch (conn.getState()) {
                                case "failed": {
                                    WebRTC.clearSenderAudioConnection(from)
                                    dispatch("startStream" , {
                                        media: ['audio'],
                                        to: [user],
                                        from
                                    })
                                }
                            }
                            console.log('1 ', conn.getState())
                        }
                    )
                    state.localStream.getTracks().forEach(track => conn.addTrack(track,state.localStream));
                    offer['audio'] = await conn.makeOffer(true , true , false);
                }
                state.socket.emit("share-stream", {
                    offer,
                    from: from,
                    to: [user.socketId],
                    media,
                    streamID,
                    firstTime
                });
            }
        } else {
            state.socket.emit("share-stream", {
                offer,
                from,
                to: [],
                media,
                streamID,
                firstTime
            });
        }
    },
    async getOffer({state , commit , dispatch} , {media , offer , from , name= null}) {
        if (media.length === 0) return
        let answer = {};
        if (media.includes('camera') && offer.hasOwnProperty('camera')) {
            let conn = WebRTC.findCameraReceiverConnection(from)
            if (! conn || conn.getState() !== "new") {
                conn = WebRTC.newCameraReceiverConnection(
                    from,
                    ({track , streams: [stream]}) => {
                        if (state.remoteStreams['camera'].hasOwnProperty(stream.id)) {
                            state.remoteStreams['camera'][stream.id] = {
                                stream, name
                            }
                            const player = document.getElementById(`${stream.id}_player`)
                            player.srcObject = stream
                        } else {
                            state.remoteStreams['camera'][stream.id] = {
                                stream, name
                            }
                            dispatch('setDynamicGrid')
                        }
                    },
                    () => {
                        console.log('camera 2 ice', conn.getICEState())
                    },
                    (e) => {
                        if (e.candidate) {
                            state.socket.emit("send-sender-candidate" , {
                                candidate: e.candidate,
                                media: WebRTC.getTypes().camera,
                                to: from
                            })
                        }
                    },
                    () => {
                        switch (conn.getState()) {
                            case "failed":
                                WebRTC.clearReceiverCameraConnections(from)
                                state.socket.emit("reconnect" , {
                                    media: ['camera'],
                                    to: from
                                })
                                break
                        }
                        console.log( 'camera 2 ',conn.getState())
                    }
                )
            }
            await conn.setRemoteDesc(offer.camera);
            answer['camera'] = await conn.makeAnswer()
        }
        if (media.includes('screen') && offer.hasOwnProperty('screen')) {
            let conn = WebRTC.findScreenReceiverConnection(from)
            if (! conn || conn.getState() !== "new") {
                conn = WebRTC.newScreenReceiverConnection(
                    from,
                    ({track , streams: [stream]}) => {
                        state.remoteStreams['screen'][stream.id] = stream
                        dispatch('updateShareScreen')
                    },
                    () => {
                        console.log('2 ice', conn.getICEState())
                    },
                    (e) => {
                        if (e.candidate) {
                            state.socket.emit("send-sender-candidate" , {
                                candidate: e.candidate,
                                media: WebRTC.getTypes().screen,
                                to: from
                            })
                        }
                    },
                    () => {
                        switch (conn.getState()) {
                            case "connected":
                                commit('setContent' , true);
                                commit('setShareScreen' , true);
                                commit('controlScreenLoader' , false);
                                break
                            case "failed":
                                WebRTC.clearReceiverScreenConnection(from)
                                state.socket.emit("reconnect" , {
                                    media: ['screen'],
                                    to: from
                                })
                                commit('setContent' , false);
                                commit('setShareScreen' , false);
                                commit('controlScreenLoader' , true);
                                break;
                            case "new":
                            case "connecting":
                                commit('controlScreenLoader' , true);
                                break
                            default:
                                commit('setContent' , false);
                                commit('setShareScreen' , false);
                                commit('controlScreenLoader' , true);
                        }
                        console.log('screen 2 ',conn.getState())
                    }
                )
            }
            await conn.setRemoteDesc(offer.screen);
            answer['screen'] = await conn.makeAnswer()
        }
        if (media.includes('audio') && offer.hasOwnProperty('audio')) {
            let conn = WebRTC.findAudioReceiverConnection(from)
            if (! conn || conn.getState() !== "new") {
                conn = WebRTC.newAudioReceiverConnection(
                    from,
                    ({track , streams: [stream]}) => {
                        if (state.remoteStreams['audio'].hasOwnProperty(stream.id)) {
                            state.remoteStreams['audio'][stream.id] = stream
                            let audio  = document.getElementById(stream.id);
                            let newElement = false;
                            if  (! audio) {
                                audio  = document.createElement('audio');
                                newElement = true
                            }
                            audio.autoplay = true;
                            audio.srcObject = stream;
                            audio.load();
                            if (newElement) {
                                document.getElementById('main').appendChild(audio);
                            }
                        } else {
                            state.remoteStreams['audio'][stream.id] = stream
                            let audio  = document.createElement('audio');
                            audio.autoplay = true;
                            audio.defaultMuted  = false;
                            audio.classList.add('hidden');
                            audio.id = stream.id;
                            audio.setAttribute("muted","true")
                            audio.srcObject = stream;
                            audio.load();
                            document.getElementById('main').appendChild(audio);
                        }
                        commit('controlSound' , {
                            value: state.sound
                        })
                    },
                    () => {
                        console.log('audio 2 ice', conn.getICEState())
                    },
                    (e) => {
                        if (e.candidate) {
                            state.socket.emit("send-sender-candidate" , {
                                candidate: e.candidate,
                                media: WebRTC.getTypes().audio,
                                to: from
                            })
                        }
                    },
                    () => {
                        switch (conn.getState()) {
                            case "failed":
                                WebRTC.clearReceiverAudioConnection(from)
                                state.socket.emit("reconnect" , {
                                    media: ['audio'],
                                    to: from
                                })
                                break
                        }
                        console.log('audio 2 ',conn.getState())
                    }
                )
            }
            await conn.setRemoteDesc(offer.audio);
            answer['audio'] = await conn.makeAnswer()
        }
        state.socket.emit('make-answer',{
            answer,
            to: from,
            media
        })
    },
    async answerMade({state , dispatch} , {media ,from , answer})  {
        if (media.length > 0) {
            if (media.includes('camera') && answer.hasOwnProperty('camera')) {
                let conn = WebRTC.findCameraSenderConnection(from)
                if (! conn) {
                    throw new Error("peer connection not found")
                }
                await conn.setRemoteDesc(answer.camera)
            }
            if (media.includes('screen') && answer.hasOwnProperty('screen')) {
                let conn = WebRTC.findScreenSenderConnection(from)
                if (! conn) {
                    throw new Error("peer connection not found")
                }
                await conn.setRemoteDesc(answer.screen)
            }
            if (media.includes('audio') && answer.hasOwnProperty('audio')) {
                let conn = WebRTC.findAudioSenderConnection(from)
                if (! conn) {
                    throw new Error("peer connection not found")
                }
                await conn.setRemoteDesc(answer.audio)
            }
        }
    },

    shareFile({state} , data) {
        state.socket.emit("share-file", data);
    },
    shareFileTo({state} , data) {
        state.socket.emit("share-file-to", data);
    },
    getSharedFile({state , commit}) {
        const iframeContainer = document.getElementById("iframeContainer");
        if (iframeContainer && state.remoteStreams['file']) {
            iframeContainer.innerHTML = "";
            const data = state.remoteStreams['file']
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
        }
    },

    endStream({state , commit , dispatch} , {media}) {
        let streams = {}
        if (media.includes('screen')) {
            streams['screen'] = true
            if (state.displayStream) {
                delete state.remoteStreams['screen'][state.displayStream.id]
                state.displayStream.getTracks().forEach(function(track) { track.stop(); })
                state.shareScreen = false;
                state.displayStream = null;
            }
            WebRTC.traverseSenderScreenConnections((pc , key) => {
                pc.close()
                WebRTC.clearSenderScreenConnection(key)
            })
            commit('setContent' , false)
            commit('setShareScreen' , false)
            commit('setShareFile' , false)
            commit('controlScreenLoader',false);
        }

        if (media.includes('camera')) {
            if (state.videoStream) {
                streams['camera'] = true
                delete state.remoteStreams['camera'][state.videoStream.id]
                state.videoStream.getTracks().forEach(function(track) { track.stop(); })
                state.videoStream = null;
            }
            WebRTC.traverseSenderCameraConnections((pc , key) => {
                pc.close()
                WebRTC.clearSenderCameraConnections(key)
            })
            commit('controlCamera',false);
            commit('controlCameraLoader',false);
            dispatch('setDynamicGrid');
        }

        if (media.includes('audio')) {
            if (state.localStream) {
                streams['audio'] = true
                delete state.remoteStreams['audio'][state.localStream.id]
                state.localStream.getTracks().forEach(function(track) { track.stop(); })
                state.localStream = null;
            }
            WebRTC.traverseSenderAudioConnections((pc , key) => {
                pc.close()
                WebRTC.clearSenderAudioConnection(key)
            })
            commit('controlMicrophone',false);
        }

        if (media.length > 0) {
            state.socket.emit('end-stream' , {
                streams,
            })
        }
    },
    clearRemoteStream({state,commit,dispatch} , {streams , from}){
        if (streams) {
            if (streams.hasOwnProperty('screen') && streams.screen) {
                commit('controlScreenLoader',false);
                commit('setContent' , false)
                commit('setShareScreen' , false)
                commit('setShareFile' , false)
                delete state.remoteStreams['screen'][streams['screen']]
                const conn = WebRTC.findScreenReceiverConnection(from)
                if (conn) {
                    conn.close()
                    WebRTC.clearReceiverScreenConnection(from)
                }
            }
            if (streams.hasOwnProperty('file') && streams.file) {
                commit('controlScreenLoader',false);
                commit('setContent' , false)
                commit('setShareScreen' , false)
                commit('setShareFile' , false)
                state.remoteStreams['file'] = null
                state.file = null
            }

            if (streams.hasOwnProperty('camera') && streams.camera) {
                commit('controlCameraLoader',false);
                delete state.remoteStreams['camera'][streams['camera']]
                const conn = WebRTC.findCameraReceiverConnection(from)
                if (conn) {
                    conn.close()
                    WebRTC.clearReceiverCameraConnections(from)
                }
                dispatch('setDynamicGrid');
            }
            if (streams.hasOwnProperty('audio')  && streams.audio) {
                delete state.remoteStreams['audio'][streams['audio']]
                const conn = WebRTC.findAudioReceiverConnection(from)
                if (conn) {
                    conn.close()
                    WebRTC.clearReceiverAudioConnection(from)
                }
                const el = document.getElementById(streams['audio']);
                if (el) el.remove()
            }
        }
    },

    async joinStream({state , dispatch} , {from}) {
        if (state.videoStream) {
            await dispatch('startStream',{from: state.socket.id,to: [from] ,media: ['camera'] ,firstTime: false})
        }
        if (state.localStream) {
            await dispatch('startStream',{from: state.socket.id,to: [from] ,media: ['audio'] ,firstTime: false})
        }
        if (state.displayStream) {
            await dispatch('startStream',{from: state.socket.id,to: [from] ,media: ['screen'] ,firstTime: false})
        }
        if (state.file) {
            dispatch('shareFileTo' , {
                file: state.file,
                to: from.socketId
            })
        }
    },
    async reconnect({state , dispatch} , {from , media}) {
        if (state.videoStream && media.includes('camera')) {
            await dispatch('startStream',{from: state.socket.id,to: [from] ,media: ['camera'] ,firstTime: false})
        }
        if (state.localStream && media.includes('audio')) {
            await dispatch('startStream',{from: state.socket.id,to: [from] ,media: ['audio'] ,firstTime: false})
        }
        if (state.displayStream  && media.includes('screen')) {
            await dispatch('startStream',{from: state.socket.id,to: [from] ,media: ['screen'] ,firstTime: false})
        }
    },
    async reconnectToAll({state , dispatch} , media) {
        if (state.videoStream && media.includes('camera')) {
            await dispatch('videoShare')
        }
        if (state.localStream && media.includes('audio')) {
            await dispatch('audioShare')
        }
        if (state.displayStream && media.includes('screen')) {
            await dispatch('screenShare')
        }
        if (state.file && media.includes('file')) {
            dispatch('shareFile' , state.file)
        }
    },

    setDynamicGrid({state}) {
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
                const name = document.createElement('span')
                box.id = key;
                box.classList.add('inner-box');
                name.classList.add('inner-box-label');
                name.classList.add('rounded');
                name.innerHTML = value?.name ?? 'ناشناس'
                const video = document.createElement('video')
                video.srcObject = value.stream;
                video.muted = true;
                video.id = `${key}_player` ;
                video.autoplay = true;
                video.playsinline = true;
                box.appendChild(video)
                box.appendChild(name)
                outerBox.appendChild(box);
            }
        } else {
            outerBox.innerHTML = '';
            state.remoteStreams['camera'] = {}
        }
    },
    updateShareScreen({state}) {
        const streams = Object.entries(state.remoteStreams['screen'] ?? {})
        for (const [key , value] of streams) {
            document.getElementById('screen-player').srcObject = value;
        }
    },

    async setDevices({state,dispatch}) {
        try {
            let stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            stream.getTracks().forEach(function (track) {
                track.stop()
            })
            stream = null
        } catch (error) {
            console.error('Permission denied or error occurred:', error);
        }
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
}