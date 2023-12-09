export const actions = {
    fillRTCs({state , dispatch} , clients){
        for (const index in clients) {
            if (state.user.user && clients[index].user.id !== state.user.user.id) {
                if ( ! state.peerConnections[index] || ! state.peerConnections[index]['pc'] ) {
                    state.peerConnections[index] = {
                        user_id: clients[index].user.id,
                        pc: {
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
                            screen: new RTCPeerConnection({
                                iceServers: [
                                    { urls: 'stun:stun.l.google.com:19302' },
                                ],
                            })
                        }
                    };
                    state.peerConnections[index]['pc']['remote'].ontrack = async function (stream) {
                        if (stream.track.kind === 'video') {
                            let video = document.getElementById('video-player');
                            video.srcObject = stream.streams[0];
                            video.load();
                        } else if(stream.track.kind === 'audio') {
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
        } else {
            let constraints = {
                video: data.video ? ( {deviceId: context.state.selectedVideoDevice ? {exact: context.state.selectedVideoDevice} : undefined} ) : false,
                audio: data.audio
            };
            navigator.mediaDevices.getUserMedia(constraints).then(async function (stream) {
                const localStream = stream;
                context.state.localStream = localStream;
                if (data.media === 'camera') {
                    context.state.showing = true;
                }
                for (const id in context.state.peerConnections) {
                    if (context.state.peerConnections[id]['pc']) {
                        context.state.localStream.getTracks().forEach(track => {
                            context.state.peerConnections[id]['pc']['local'].addTrack(track,localStream)
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
            });
        }
    },
    async startStream({state} , data) {
        const PC = data.media === 'screen' ? 'screen' : 'local';
        let offer = await state.peerConnections[data.to]['pc'][PC].createOffer();
        await state.peerConnections[data.to]['pc'][PC].setLocalDescription(new RTCSessionDescription(offer));
        state.socket.emit("share-stream", {
            offer,
            from: data.from,
            to: data.to,
            media: data.media,
            streamID: data.streamID
        });
    },
    async getOffer({state , commit} , data) {
        const PC = data.data.media === 'screen' ? 'screen' : 'remote';
        if (state.peerConnections[data.data.from] && state.peerConnections[data.data.from]['pc']) {
            await state.peerConnections[data.data.from]['pc'][PC].setRemoteDescription(
                new RTCSessionDescription(data.data.offer)
            );

            const answer = await state.peerConnections[data.data.from]['pc'][PC].createAnswer();

            await state.peerConnections[data.data.from]['pc'][PC].setLocalDescription(new RTCSessionDescription(answer));

            if (data.data.media === 'camera') {
                state.hiddenVideo = false;
            }

            if (data.data.media === 'screen') {
                state.shareScreen = true;
            }

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
        const PC = data.data.media === 'screen' ? 'screen' : 'local';
        await context.state.peerConnections[data.data.from]['pc'][PC].setRemoteDescription(
            new RTCSessionDescription(data.data.answer)
        );
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
        if (state.localStream && (data.data.media === 'camera' || data.data.media === 'audio') ) {
            state.localStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc']['local'].addTrack(track, state.localStream));
            dispatch('startStream',{
                from: state.socket.id,
                to: data.data.from,
                media: data.data.media
            })
        }
        if (state.displayStream && data.data.media === 'screen') {
            console.log(data.data.media);
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
            if (state.localStream) {
                const streamID = state.localStream.id;
                state.localStream.getTracks().forEach(function(track) { track.stop(); })
                state.localStream = null;
                state.showing = false;
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
        if (data.data.media === 'camera') {
            context.commit('updateHiddenCamera',true);
        }
        if (data.data.from !== context.state.socket.id) {
            if (data.data.media === 'screen') {
                context.state.shareScreen = false;
            }
            delete context.state.remoteStreams[data.data.streamID];
            const el = document.getElementById(data.data.streamID);
            if (el) {
                el.remove();
            }
        }
    }
}