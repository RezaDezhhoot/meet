<template>
  <top  @logout="logout" :room="room" :host="host" :user="user" :clients="clients" :socket="socket"></top>
  <main>
    <sidebar :room="room" :host="host" :user="user" :clients="clients" ref="sidebar" :socket="socket"></sidebar>
<!--    <content  :user="user" :clients="clients" :socket="socket"></content>-->
    <audio class="" controls v-bind:id="`audio-player-${socket.id}`" autoplay ref="localAudio"></audio>

  </main>
</template>
=room
<script>
import Top from "../components/Meetin/Top.vue";
import Sidebar from "../components/Meetin/Sidebar.vue";
import Content from "../components/Meetin/Content.vue";
import io from 'socket.io-client';
import { inject } from 'vue';

export default {
  components: {
    top: Top,
    sidebar: Sidebar,
    content: Content
  },
  data(){
    return {
      user: Object,
      room: Object,
      host: null,
      clients:[],
      socket: null,
      baseUrl: inject('BaseUrl'),
    };
  },
  name: "Meeting",
  async created() {
    this.$emit('check-if-user-was-logged-in',this.$route.params.key);
    this.user = this.$cookies.get('auth');

    let conencted = false;
    do {
      conencted = await this.connect()
    } while (! conencted);


    await this.wires();
    await this.join();
  },
  methods:{
    async connect(){
      this.socket = io(`${this.baseUrl}/channel/v1-${this.$route.params.key}`);
      this.$store.commit('setSocket' , this.socket);
      return this.socket;
    },
    async join(){
      this.socket.emit('join',{
        token: this.user.token,
        type: this.user.type,
        name: this.user.name
      })
    },
    async disconnect(){

    },
    async wires() {
      this.socket.on('get-room',async data => {
        if (data.status === 200) {
          this.room = data.data.room;
        }
      });

      this.socket.on('get-users',async data => {
        if (data.status === 200) {
          this.clients = data.data.users;
          this.user = data.data.users[this.socket.id];
          this.$store.commit('setUser',this.user);
        }
      });

      this.socket.on('host-joined',async data => {
        if (data.status === 200) {
          this.host = data.data.host;
        }
      });

      this.socket.on('error', async data => {
        if (data.data.code !== 404) {
          this.clearCookie();
        }

        this.redirectClientIfHappenedError(this.$route.params.key , data.data.code);
      });
      this.socket.on('create-pc' , async data => {
        if (data.status === 200) {
          this.$store.commit('fillRTCs',this.clients);
          // if (data.data.shared_camera) {
          //   this.socket.emit('get-shared-camera',{
          //     from: this.socket.id
          //   })
          // }

        }
      });
      this.socket.on('get-audio-offer' , async data => {
        this.$store.dispatch('getAudioOffer',data);
      });
      this.socket.on('audio-answer-made' , async data => {
        this.$store.dispatch('audioAnswerMade',data);
      });
    },
    redirectClientIfHappenedError(room = null , code = null){
      this.$router.push({
        name: "error",
        params:{
          code
        },
        query:{
          room
        }
      });
    },
    logout(){
      this.clearCookie();
      this.$emit('check-if-user-was-logged-in',this.$route.params.key);
    },
    clearCookie(){
      this.$cookies.remove('auth');
    }
  },
  async unmounted() {
    await this.disconnect();
  }
}
</script>
