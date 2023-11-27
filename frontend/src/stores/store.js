import {createStore} from 'vuex'

const { RTCPeerConnection, RTCSessionDescription  } = window;

export const store = createStore({
  state:{
    localStream: null,
    localAudioStream: null,
    sound: false,
    user: null,
    peerConnections: Object,
    socket: Object,
    hiddenVideo: true,
    showing: false,
  },
  mutations: {
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
          console.log(status);
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
      localStorage.setItem('sound',value.value);
      Array.from(document.querySelectorAll('audio, video')).forEach(el => el.muted = ! value.value)
      Array.from(document.querySelectorAll('.self-media')).forEach(el => el.muted = true)
    }
  },
  actions:{
    fillRTCs({state , dispatch} , clients){
      for (const index in clients) {
        if (clients[index].user.id !== state.user.user.id) {
          if ( ! state.peerConnections[index] || ! state.peerConnections[index]['pc'] ) {
            state.peerConnections[index] = {
              user_id: clients[index].user.id,
              pc: new RTCPeerConnection({
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19302' },
                ],
              })
            };
            state.peerConnections[index]['pc'].ontrack = function (stream) {
              if (stream.track.kind === 'video') {
                let video = document.getElementById('video-player');
                video.srcObject = stream.streams[0];
                video.load();
              } else if(stream.track.kind === 'audio') {
                const audio = document.createElement("audio");
                audio.setAttribute('id',stream.track.id)
                audio.setAttribute('controls','1');
                audio.setAttribute('autoplay','1');
                audio.srcObject = stream.streams[0];
                const muted = ! (localStorage.getItem('sound') == 'true');
                audio.setAttribute('muted',muted);
                document.body.appendChild(audio);
              }
            };
          }
          if (clients[index].media.settings.camera || clients[index].media.settings.audio) {
            state.socket.emit('get-shared' , {
              from: state.socket.id,
              to: index,
              media: clients[index].media.settings.camera ? 'camera' : 'audio'
            })
          }
        }
      }
    },
    async shareStream(context , data) {
      const localStream = await navigator.mediaDevices.getUserMedia({video: data.video, audio: data.audio});
      context.state.localStream = localStream;
      if (data.media === 'camera') {
        context.state.showing = true;
      }
      for (const id in context.state.peerConnections) {
        if (context.state.peerConnections[id]['pc']) {
          context.state.localStream.getTracks().forEach(track => context.state.peerConnections[id]['pc'].addTrack(track,localStream));
          await context.dispatch('startStream',{
            from: context.state.socket.id,
            to: id,
            media: data.media
          })
        }
      }
    },
    async startStream({state} , data) {
      let offer = await state.peerConnections[data.to]['pc'].createOffer();
      await state.peerConnections[data.to]['pc'].setLocalDescription(new RTCSessionDescription(offer));
      state.socket.emit("share-stream", {
        offer,
        from: data.from,
        to: data.to,
        media: data.media
      });
    },
    async getOffer({state , commit} , data) {
      if (state.peerConnections[data.data.from] && state.peerConnections[data.data.from]['pc']) {
        await state.peerConnections[data.data.from]['pc'].setRemoteDescription(
            new RTCSessionDescription(data.data.offer)
        );

        const answer = await state.peerConnections[data.data.from]['pc'].createAnswer();

        await state.peerConnections[data.data.from]['pc'].setLocalDescription(new RTCSessionDescription(answer));

        if (data.data.media === 'camera') {
          state.hiddenVideo = false;
        }

        state.socket.emit('make-answer',{
          answer,
          to: data.data.from,
          media: data.data.media
        })
      }
    },
    async answerMade(context , data) {
      await context.state.peerConnections[data.data.from]['pc'].setRemoteDescription(
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
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => state.peerConnections[data.data.from]['pc'].addTrack(track, state.localStream));
        dispatch('startStream',{
          from: state.socket.id,
          to: data.data.from,
          media: data.data.media
        })
      }
    },
    endStream(state) {
      try {
        if (state.localStream) {
          state.localStream.getTracks().forEach(function(track) { track.stop(); })
          state.localStream = null;
          state.showing = false;
          for (const id in state.peerConnections) {
            if (state.peerConnections[id]['pc']) {
              state.peerConnections[id]['camera_shared'] = false;
              state.peerConnections[id]['audio_shared'] = false;
            }
          }
        }
      } catch (err) {}
    },
  }
});
