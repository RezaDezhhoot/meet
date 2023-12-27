<template>
  <div v-if="mainLoading" class="loader">
    <loader></loader>
  </div>

  <top  @logout="logout" :room="room" :host="host" :user="user" :clients="clients" :socket="socket"></top>
  <main id="main">
    <sidebar></sidebar>
    <content></content>
  </main>
</template>
<script>
import Top from "../components/Meetin/Top.vue";
import Loader from "../components/Meetin/Elements/Loader.vue";
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
    loader: Loader
  },
  data(){
    return {
      user: Object,
      room: Object,
      host: null,
      hostClient: null,
      clients:[],
      socket: null,
      baseUrl: inject('BaseUrl'),
      logo: inject('LogoAddr'),
    };
  },
  beforeCreate() {
    this.$store.commit('controlMainLoader' , true);
  },
  beforeMount() {
    this.$emit('check-if-user-was-logged-in',this.$route.params.key);
    this.user = this.$cookies.get('auth');
    this.$store.commit('setLogo' , this.logo);
    axios.get(`/v1/rooms/${this.$route.params.key}`).then(res => {
      this.room = res.data.room;
      document.title = this.room.title;
      this.$store.commit('setRoom',this.room);
      this.$store.commit('setHost',this.room.host);

    }).catch(err => {
      this.redirectClientIfHappenedError(this.$route.params.key,404);
    });
    this.wires();
  },
  async created() {
    let connected = false;
    do {
      connected = await this.connect()
    } while (! connected);
    this.join();
  },
  computed:{
    mainLoading() {
      return this.$store.state.mainLoading
    }
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
      });

      this.socket.on('host-joined',async data => {
        if (data.status === 200) {
          this.hostClient = data.data.host;
          this.$store.commit('setHostClient',this.hostClient);
        }
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
