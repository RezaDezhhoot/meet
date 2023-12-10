import {createStore} from 'vuex'

const { RTCPeerConnection, RTCSessionDescription  } = window;

import {actions} from './actions';
import {mutations} from './mutations';
import {state} from './state';
import Swal from 'sweetalert2'

export const store = createStore({
  state,
  mutations,
  actions
});
