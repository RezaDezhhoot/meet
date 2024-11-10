<template>
  <div v-if="! conected" class="loader">
    <loader></loader>
  </div>


  <top @logout="logout" :room="room" :host="host" :user="user" :clients="clients" :socket="socket"></top>
  <main id="main">
    <div v-if="lowSignal">
      <low-signal></low-signal>
    </div>
    <sidebar></sidebar>
    <content></content>
  </main>
</template>
<script>
import Top from "../components/Meetin/Top.vue";
import Loader from "../components/Meetin/Elements/Loader.vue";
import LowSignal from "../components/Meetin/Elements/LowSignal.vue";
import Sidebar from "../components/Meetin/Sidebar.vue";
import Content from "../components/Meetin/Content.vue";
import io from 'socket.io-client';
import {inject} from 'vue';
import axios from 'axios'

export default {
  components: {
    top: Top,
    sidebar: Sidebar,
    content: Content,
    loader: Loader,
    lowSignal: LowSignal
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
    };
  },
  beforeCreate() {
    this.$emit('check-if-user-was-logged-in',this.$route.params.key);
    this.$store.commit('controlMainLoader' , true);
  },
  beforeMount() {
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
    await this.connect()
  },
  methods:{
    async connect(){
      this.socket = io(`${this.baseUrl}/channel/v1-${this.$route.params.key}`);
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
        console.log(data.data);
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
