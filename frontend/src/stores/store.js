import { createStore } from 'vuex'
const { RTCPeerConnection, RTCSessionDescription  } = window;

export const store = createStore({
  state:{
    localStream: null,
    localAudioStream: null,
    sound: false,
    user: null,
    peerConnections: Object,
    socket: Object,
  },
  mutations: {
    setLocalStream(state , stream){
      state.localStream = stream;
    },
    setLocalAudioStream(state , stream) {
      state.localAudioStream = stream;
    },
    setUser(state,user){
      state.user = user;
    },
    setSocket(state , socket){
      state.socket = socket;
    },
    fillRTCs(state , clients){
      for (const index in clients ) {
        if (clients[index].user.id !== state.user?.user?.id && (! state.peerConnections[index] || ! state.peerConnections[index]['pc'])) {
          state.peerConnections[index] = {
            user_id: clients[index].user.id,
            pc: new RTCPeerConnection({
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
              ],
            })
          };
          state.peerConnections[index]['pc'].ontrack = function ({ streams: [stream] }) {
            let audio = document.getElementById(`audio-player-${state.socket.id}`);
            console.log(audio);
            // video.srcObject = stream;
            // video.load();
          };
        }
      }
    },
    controlLocalMicrophone(state , status) {
      try {
        if (state.localStream) {
          state.localStream.getAudioTracks()[0].enabled = status;
        } else if(state.localAudioStream) {
          state.localStream.getAudioTracks()[0].enabled = status;
        }
      } catch (err) {}
    },
    turnOffLocalCamera(state) {
      try {
        if (state.localStream) {
          state.localStream.getTracks().forEach(function(track) { track.stop(); })
          state.localStream = null;
        }
      } catch (err) {}
    },
    turnOffLocalMicrophone(state) {
      try {
        if (state.localAudioStream) {
          state.localAudioStream.getTracks().forEach(function(track) { track.stop(); })
          state.localAudioStream = null;
        }
      } catch (err) {}
    },
    controlSound(state , value){
      state.sound = value.value;
      Array.from(document.querySelectorAll('audio, video')).forEach(el => el.muted = ! value.value)
      Array.from(document.querySelectorAll('.self-media')).forEach(el => el.muted = true)
    }
  },
  actions:{
    async shareAudio(context){
      let localAudioStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true})
      context.commit('setLocalAudioStream',localAudioStream);
      for (const id in context.state.peerConnections) {
        if (context.state.peerConnections[id]['pc']) {
          context.state.localAudioStream.getTracks().forEach(track => context.state.peerConnections[id]['pc'].addTrack(track, context.state.localAudioStream));
          await context.dispatch('startAudio',{
            from: context.state.socket.id,
            to: id
          });
        }
      }
    },
    async startAudio(context , data) {
      let offer = await context.state.peerConnections[data.to]['pc'].createOffer();
      await context.state.peerConnections[data.to]['pc'].setLocalDescription(new RTCSessionDescription(offer));
      context.state.socket.emit("share-audio", {
        offer, from: data.from , to: data.to
      });
    },

    async getAudioOffer(context , data) {
      if (context.state.peerConnections[data.data.from] && context.state.peerConnections[data.data.from]['pc']) {
        await context.state.peerConnections[data.data.from]['pc'].setRemoteDescription(
            new RTCSessionDescription(data.data.offer)
        );

        const answer = await context.state.peerConnections[data.data.from]['pc'].createAnswer();

        await context.state.peerConnections[data.data.from]['pc'].setLocalDescription(new RTCSessionDescription(answer));

        context.state.socket.emit('audio-make-answer',{
          answer,
          to: data.data.from
        })
      }
    },

    async audioAnswerMade(context , data) {
      await context.state.peerConnections[data.data.from]['pc'].setRemoteDescription(
          new RTCSessionDescription(data.data.answer)
      );
      if (! context.state.peerConnections[data.data.from]['audio_shared']) {
        context.state.peerConnections[data.data.from]['audio_shared'] = true;
        await context.dispatch('startAudio',{
          from: context.state.socket.id,
          to: data.data.from
        });
      }
    }
  }
});
