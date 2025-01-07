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
import RoomClient from '../services/RoomClient'
let rc

export const actions = {
    async init(context , {room , name}) {
        const videoArea = document.getElementById('outer-box')
        const audioArea = document.getElementById('audios')
        context.state.videoArea = videoArea

        rc = new RoomClient(context.state.videoArea,context.state.videoArea,audioArea,window.mediasoupClient,context.state.socket,room.key , name , context,function (){},function (kind = null) {
            if (!kind || kind === 'video') {
                context.dispatch('setDynamicGrid')
            }
        })
    },
    async controlDevices({state} , media) {
        if (rc) {
            switch (media) {
                case 'camera':
                    rc.closeProducer(RoomClient.mediaType.video)
                    break;
                case 'microphone':
                    rc.closeProducer(RoomClient.mediaType.audio)
                    break
            }
        }
    },
    async addSenderIceCandidate({state} , {media , from , candidate}) {
        const types = WebRTC.getTypes()
        let conn
        switch (media) {
            case types.screen:
                conn = WebRTC.findScreenConnection(from)
                break;
        }
        if (! conn) return
        conn.addIceCandidate(candidate)
    },
    async addReceiverIceCandidate({state} , {media , from , candidate}) {
        const types = WebRTC.getTypes()
        let conn
        switch (media) {
            case types.screen:
                conn = WebRTC.findScreenConnection(from)
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
    async shareStream({state , dispatch} , data) {
        switch (data.media) {
            case 'screen':
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: false}).then(async function(stream){
                    stream.getVideoTracks()[0].onended = function () {
                        dispatch('endStream',{
                            media: ['screen']
                        })
                    };
                    state.displayStream = stream;
                    await dispatch('screenShare')
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
                break
            case 'camera':
                if (! state.user.media.media.local.camera) {
                    await rc.produce(RoomClient.mediaType.video , state.selectedVideoDevice ,function (ok , err) {
                        state.user.media.media.local.camera = true;
                        if (ok) {
                            state.socket.emit('control-local-media',{
                                device: 'camera',
                                action: true
                            });
                        } else {
                            state.user.media.media.local.camera = false;
                            console.log(err)
                            let text = 'مشکلی در یافتن اطلاعات دوربین رخ داده است لطفا مجدد تلاش کنید!';
                            Swal.fire({
                                position: 'top-start',
                                text,
                                icon: 'warning',
                                showConfirmButton: false,
                                backdrop: false,
                                timer: 3500,
                            })
                        }
                    })
                } else {
                    rc.closeProducer(RoomClient.mediaType.video)
                    state.socket.emit('control-local-media',{
                        device: 'camera',
                        action: false
                    });
                    state.user.media.media.local.camera = false;
                }
                break
            case 'microphone':
                if (! state.user.media.media.local.microphone) {
                    if (rc.hasProducer(RoomClient.mediaType.audio)) {
                        rc.resumeProducer(RoomClient.mediaType.audio)
                        state.socket.emit('control-local-media',{
                            device: 'microphone',
                            action: true
                        });
                        state.user.media.media.local.microphone = true;
                        return
                    }
                    await rc.produce(RoomClient.mediaType.audio , state.selectedAudioDevice ,function (ok , err) {
                        if (ok) {
                            state.socket.emit('control-local-media',{
                                device: 'microphone',
                                action: true
                            });
                            state.user.media.media.local.microphone = true;
                        } else {
                            console.log(err)
                            let text = 'مشکلی در یافتن اطلاعات میکروفون رخ داده است لطفا مجدد تلاش کنید!';
                            Swal.fire({
                                position: 'top-start',
                                text,
                                icon: 'warning',
                                showConfirmButton: false,
                                backdrop: false,
                                timer: 3500,
                            })
                        }
                    })
                } else {
                    rc.pauseProducer(RoomClient.mediaType.audio)
                    state.socket.emit('control-local-media',{
                        device: 'microphone',
                        action: false
                    });
                    state.user.media.media.local.microphone = false;
                }
                break
        }
    },
    async startStream({state , dispatch , commit} , {media , to , from , firstTime = false}) {
        if (media.length === 0) return
        to = Object.values(to);
        let offer = {} , streamID = {};
        if (media.includes('screen') && state.displayStream)
            streamID['screen'] = state.displayStream.id;

        if (to.length > 0) {
            for (const user of to) {
                if (user.socketId === from) continue
                if (media.includes('screen') && state.displayStream) {
                    const conn = WebRTC.newScreenConnection(
                        user.socketId,
                        'sendonly',
                        null,
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
                                    WebRTC.clearScreenConnection(from)
                                    dispatch("startStream" , {
                                        media: 'screen',
                                        to: [user],
                                        from
                                    })
                                }
                            }
                            // hande failed to reconnect
                            console.log('sender ', conn.getState())
                        }
                    )
                    state.displayStream.getTracks().forEach(track => conn.addTrack(track,state.displayStream));
                    offer['screen'] = await conn.makeOffer(true , false , true);
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
        if (media.includes('screen') && offer.hasOwnProperty('screen')) {
            let conn = WebRTC.findScreenConnection(from)
            if (! conn || conn.getState() !== "new") {
                conn = WebRTC.newScreenConnection(
                    from,
                    'recvonly',
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
                                WebRTC.clearScreenConnection(from)
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
        state.socket.emit('make-answer',{
            answer,
            to: from,
            media
        })
    },
    async answerMade({state , dispatch} , {media ,from , answer})  {
        if (media.length > 0) {
            if (media.includes('screen') && answer.hasOwnProperty('screen')) {
                let conn = WebRTC.findScreenConnection(from)
                if (! conn) {
                    throw new Error("peer connection not found")
                }
                await conn.setRemoteDesc(answer.screen)
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
            WebRTC.traverseScreenConnections((pc , key) => {
                pc.close()
                WebRTC.clearScreenConnection(key)
            })
            commit('setContent' , false)
            commit('setShareScreen' , false)
            commit('setShareFile' , false)
            commit('controlScreenLoader',false);
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
                const conn = WebRTC.findScreenConnection(from)
                if (conn) {
                    conn.close()
                    WebRTC.clearScreenConnection(from)
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
        }
    },

    async joinStream({state , dispatch} , {from}) {
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
        if (state.displayStream  && media.includes('screen')) {
            await dispatch('startStream',{from: state.socket.id,to: [from] ,media: ['screen'] ,firstTime: false})
        }
    },
    async reconnectToAll({state , dispatch} , media) {
        if (state.displayStream && media.includes('screen')) {
            await dispatch('screenShare')
        }
        if (state.file && media.includes('file')) {
            dispatch('shareFile' , state.file)
        }
    },

    setDynamicGrid({state} , refresh = false) {
        const outerBox = state.videoArea;
        if (outerBox) {
            const boxCount = outerBox?.querySelectorAll('.inner-box')?.length ?? 0;
            let columns = Math.ceil(Math.sqrt(boxCount));
            let rows = Math.ceil(boxCount / columns);
            let columnWidth = 100 / columns;
            let rowHeight = 100 / rows;
            outerBox.style.gridTemplateColumns = `repeat(${columns}, ${columnWidth}%)`;
            outerBox.style.gridTemplateRows = `repeat(${rows}, ${rowHeight}%)`;
            if (refresh) {
                const newBox = document.querySelector('.outer-box')
                if (newBox) {
                    newBox.replaceWith(outerBox)
                }
            }
        }
    },
    updateShareScreen({state}) {
        const streams = Object.entries(state.remoteStreams['screen'] ?? {})
        for (const [key , value] of streams) {
            document.getElementById('screen-player').srcObject = value;
        }
    },

    async setDevices({state,dispatch}) {
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