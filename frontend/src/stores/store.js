import { createStore } from 'vuex'

export const store = createStore({
  state:{
    localStream: null,
    localAudioStream: null,
    sound: false,
  },
  mutations: {
    setLocalStream(state , stream){
      state.localStream = stream;
    },
    setLocalAudioStream(state , stream) {
      state.localAudioStream = stream;
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

});
