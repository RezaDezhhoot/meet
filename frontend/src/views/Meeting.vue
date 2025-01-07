<template>
  <div v-if="! connected" class="loader">
    <loader></loader>
  </div>
  <top2 v-if="room.ui === 2" :ping="pingValue" @logout="logout" :room="room" :host="host" :user="user" :clients="clients" :socket="socket"></top2>
  <top v-else @logout="logout" :ping="pingValue" :room="room" :host="host" :user="user" :clients="clients" :socket="socket"></top>
  <main id="main"  :class="room.ui === 2 ? 'bg-black' : ''">
    <div v-if="lowSignal">
      <low-signal></low-signal>
    </div>
    <sidebar :width="(showUserBox || showChatBox || content) ? 30 : 0"></sidebar>
    <template v-if="! content ">
      <Camera height="100"></Camera>
    </template>
    <content v-if="content"></content>
  </main>
  <div id="audios" class="hidden">

  </div>
</template>
<script>
import Top from "../components/Meetin/Top.vue";
import Top2 from "../components/Meetin/Top2.vue";
import Loader from "../components/Meetin/Elements/Loader.vue";
import LowSignal from "../components/Meetin/Elements/LowSignal.vue";
import Sidebar from "../components/Meetin/Sidebar.vue";
import Content from "../components/Meetin/Content.vue";
import io from 'socket.io-client';
import {inject} from 'vue';
import axios from 'axios'
import Camera from "../components/Meetin/Camera.vue";
import Swal from "sweetalert2";
// const mediasoupClient = await import('mediasoup-client');

export default {
  components: {
    top: Top,
    top2: Top2,
    sidebar: Sidebar,
    content: Content,
    loader: Loader,
    lowSignal: LowSignal,
    Camera,
  },
  data(){
    return {
      user: Object,
      room: Object,
      host: null,
      hostClient: null,
      clients:[],
      socket: null,
      mainLoading: true,
      baseUrl: inject('BaseUrl'),
      logo: null,
      lowSignal: false,
      onLine: navigator.onLine,
      pingValue: 0,
      auth: null,
      lowSignalAudio: null
    };
  },
  computed:{
    showUserBox() {
      return this.$store.state.top.users;
    },
    showChatBox() {
      return this.$store.state.top.chat;
    },
    connected() {
      return this.$store.state.connected;
    },
    content(){
      return this.$store.state.main_content
    },
  },
  beforeCreate() {
    this.$emit('check-if-user-was-logged-in',this.$route.params.key);
    this.$store.commit('controlMainLoader' , true);
  },
  beforeMount() {
    this.user = this.$cookies.get('auth');
    this.auth = this.user;
    axios.get(`/v1/rooms/${this.$route.params.key}`).then(res => {
      this.room = res.data.room;
      this.$store.commit('setLogo' , this.room.logo);
      document.title = this.room.title;
      this.$store.commit('setRoom',this.room);
      this.$store.commit('setHost',this.room.host);
      this.mainLoading = false;
    }).catch(err => {
      this.redirectClientIfHappenedError(this.$route.params.key,404);
    });
    this.mainLoading = false;
    this.wires();
  },
  async created() {
    if (Notification.permission !== "granted") {
      this.requestPermission();
    }
    setInterval(async () => {
      await this.ping()
    }, 5000);
    await this.connect()
    await this.ping()

    if (this.room.ui === 2) {
      this.$store.commit('setMainContent' , false)
    }
  },
  watch: {
    lowSignal(value) {
      if (value) {
        if (! this.lowSignalAudio) {
          this.lowSignalAudio = new Audio("/smooth-completed-notify-starting-alert-274739.mp3");
        }
        this.lowSignalAudio.loop = true;
        this.lowSignalAudio.play();
      } else {
        if (this.lowSignalAudio) {
          this.lowSignalAudio.pause()
        }
      }
    }
  },
  methods:{
    requestPermission() {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
          console.log("Notification permission:", permission);
        });
      }
    },
    async connect(){
      this.socket = io(`${this.baseUrl}/channel/v1-${this.$route.params.key}`,{
        path: import.meta.env.VITE_SOCKET_PATH ?? null,
        secure: true
      });
      this.$store.commit('setSocket' , this.socket);
      this.$store.dispatch('setDevices');
      return this.socket;
    },
    async join(){
      this.socket.emit('join',{
        token: this.auth.token,
        type: this.auth.type,
        name: this.auth.name,
      })
      await this.$store.dispatch('init' , {room: this.room ,name: this.auth.name});
    },
    wires() {
      let meeting = this;
      setInterval(async function (meeting ) {
        try {
          await meeting.socket.timeout(5000).emitWithAck("ping" , {});
          meeting.lowSignal = false
        } catch (err) {
          meeting.lowSignal = true
        }
      }, 1000, meeting );

      this.socket.on('join' , async (data) => {
        this.user = data.user;
        this.$store.commit('setUser',this.user);
        let media = []
        if (this.user?.media?.settings?.camera) {
          media.push('camera')
        }
        if (this.user?.media?.settings?.audio) {
          media.push('audio')
        }
        if (this.user?.media?.settings?.screen) {
          media.push('screen')
        }
        if (this.user?.media?.settings?.file) {
          media.push('file')
        }
        if (media.length > 0) {
          await this.$store.dispatch('reconnectToAll' , media)
        } else {
          this.disconnect()
        }
      })

      this.socket.on('get-users',async data => {
        if (data.status === 200) {
          this.user = data.data.users[this.socket.id];
          this.$store.commit('setUser',this.user);
          this.clients = data.data.users;
          this.$store.commit('setClients',this.clients);
        }
      });

      this.socket.on('add-sender-candidate',async data => {
        this.$store.dispatch('addSenderIceCandidate',data);
      });
      this.socket.on('add-receiver-candidate',async data => {
        this.$store.dispatch('addReceiverIceCandidate',data);
      });
      this.socket.on('join-the-streams' , async (data) => {
        await this.$store.dispatch('joinStream' , data);
      })
      this.socket.on('reconnect' , async (data) => {
        await this.$store.dispatch('reconnect' , data);
      })
      this.socket.on('host-joined',async data => {
        if (data.status === 200) {
          this.hostClient = data.data.host;
          this.$store.commit('setHostClient',this.hostClient);
        }
      });
      this.socket.on('connect', async data => {
        this.$store.state.connected = true;
        this.lowSignal = false;
        await this.join();
      });
      this.socket.on('disconnect',async data => {
        this.lowSignal = true;
      });
      this.socket.on('error', async data => {
        if (data.data.code !== 404) {
          this.clearCookie();
        }
        this.socket.disconnect()
        this.redirectClientIfHappenedError(this.$route.params.key , data.data.code);
      });
      this.socket.on('get-offer' , async data => {
        this.$store.dispatch('getOffer',data);
      });
      this.socket.on('remote-media-controlled' , async data => {
        if (! data.data.action) {
          if (data.data.device === 'screen') {
            this.$store.dispatch('endScreen',{
              media: "screen"
            });
            this.$store.state.shareScreen = false;
          } else if (data.data.device === 'microphone') {
            this.status = false;
            this.$store.dispatch('controlDevices','microphone')
          }
          else if (data.data.device === 'camera') {
            this.status = false;
            this.$store.dispatch('controlDevices','camera')
          }
        }
      });
      this.socket.on('answer-made' , async data => {
        this.$store.dispatch('answerMade',data);
      });
      this.socket.on('share-file' , async data => {
        this.$store.state.remoteStreams['file'] = data
        this.$store.dispatch('getSharedFile');
      });
      this.socket.on('end-stream',async data => {
        this.$store.dispatch('clearRemoteStream',data)
      });
    },
    disconnect() {
      this.$store.dispatch('endStream' , {
        media: ['screen','audio','camera']
      })
    },
    redirectClientIfHappenedError(room = null , code = null){
      this.$router.push({
        name: "error",
        params: {
          code
        },
        query: {
          room
        }
      }).then(() => {
        // location.reload();
      });
    },
    async ping() {
      const url = import.meta.env.VITE_BASE_URL
      const start = performance.now()
      try {
        await fetch(url  , {method: "HEAD" , mode: "no-cors"})
      } catch (err) {
        this.pingValue = 1
        return
      }
      const end = performance.now()

      let diff =end - start;
      if (diff > 1000) {
        diff = 1000
      }
      const mappedValue = 1 + (5 - 1) * ((diff - 1) / (1000 - 1))
      this.pingValue = 5 - (Math.round(mappedValue) - 1)
    },
    logout(){
      this.clearCookie();
      this.$emit('check-if-user-was-logged-in',this.$route.params.key);
    },
    clearCookie(){
      this.$cookies.remove('auth');
    }
  }
}
</script>
