<template>
  <div v-if="! conected" class="loader">
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
      conected: false,
      lowSignal: false,
      reload: false,
      onLine: navigator.onLine,
      pingValue: 0,
    };
  },
  computed:{
    showUserBox() {
      return this.$store.state.top.users;
    },
    showChatBox() {
      return this.$store.state.top.chat;
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
    window.addEventListener("online", this.updateConnectionStatus);
    window.addEventListener("offline", this.updateConnectionStatus);

    this.user = this.$cookies.get('auth');
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
  methods:{
    requestPermission() {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
          console.log("Notification permission:", permission);
        });
      }
    },
    updateConnectionStatus() {
      this.lowSignal = navigator.onLine; // Update status
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
    join(){
      this.socket.emit('join',{
        token: this.user.token,
        type: this.user.type,
        name: this.user.name,
      })
    },
    async disconnect(){
      this.$store.dispatch('endStream',{
        media: ['camera','audio']
      });
    },
    wires() {
      let meeting = this;
      setInterval(async function (meeting ) {
        try {
          const data = await meeting.socket.timeout(1000).emitWithAck("ping" , {});
          meeting.lowSignal = false
        } catch (err) {
          meeting.lowSignal = true
          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification("مشکل در اتصال", {
              body: "اتصال اینترنت شما ضعیف است، لطفاً بررسی کنید یا منتظر بمانید تا اتصال بهبود یابد",
              icon: "/meet/internet.webp" // Optional icon URL
            });
            notification.onclick = function () {
              console.log("Notification clicked");
            };
          }
        }
      }, 105000, meeting );

      this.socket.on('get-users',async data => {
        if (data.status === 200) {
          this.clients = data.data.users;
          this.user = data.data.users[this.socket.id];
          this.$store.commit('setUser',this.user);
          this.$store.commit('setClients',this.clients);

          if (data.data.event === 'joined') {
            this.$store.dispatch('fillRTCs', {
              clients: this.clients,
              from: data.data.from
            });
            setTimeout(() => {
              this.$store.commit('controlMainLoader' , false);
            },2000);
          }
        }
        this.reload = true;

        const mediaPlayers = document.querySelectorAll('audio');
        Array.from(mediaPlayers).forEach(el => {
          el.muted = false;
          el.defaultMuted = false;
          // el.defaultMuted = ! value.value;
          el.load();
          // await el.play();
        })

      });

      this.socket.on('add-candidate',async data => {
        this.$store.dispatch('addIceCandidate',data);
      });

      this.socket.on('host-joined',async data => {
        if (data.status === 200) {
          this.hostClient = data.data.host;
          this.$store.commit('setHostClient',this.hostClient);
        }
      });
      this.socket.on('connect',async data => {
        this.conected = true;
        this.lowSignal = false;
        this.join();
        if (this.reload)
          window.location.reload(true);
      });
      this.socket.on('disconnect',async data => {
        this.lowSignal = true;
      });

      this.socket.on('error', async data => {
        if (data.data.code !== 404) {
          this.clearCookie();
        }
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
            this.$store.dispatch('endStream',{
              media: ['audio']
            })
            this.status = false;
          }
          else if (data.data.device === 'camera') {
            this.$store.dispatch('endStream',{
              media: ['camera']
            })
            this.status = false;
          }
        }
      });
      this.socket.on('answer-made' , async data => {
        this.$store.dispatch('answerMade',data);
      });
      this.socket.on('check-speakers' , async data => {
        if ( localStorage.getItem('sound') === "true") {
          this.$store.commit("controlSound",{
            value: false
          })
          this.$store.commit("controlSound",{
            value: true
          })
        }
      });

      this.socket.on('share-file' , async data => {
        this.$store.dispatch('getSharedFile',data);
      });
      this.socket.on('send-shared' , async data => {
        this.$store.dispatch('sendShared', data)
      });
      this.socket.on('end-stream',async data => {
        this.$store.dispatch('clearRemoteStream',data)
      });
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
        location.reload();
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
