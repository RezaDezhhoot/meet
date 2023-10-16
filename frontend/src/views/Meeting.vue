<template>
  <top  :room="room" :host="host" :user="user" :clients="clients" :socket="socket"></top>
  <main>
    <sidebar :room="room" :host="host" :user="user" :clients="clients" ref="sidebar" :socket="socket"></sidebar>
    <content  :user="user" :clients="clients" :socket="socket"></content>
  </main>
</template>
=room
<script>
import Top from "../components/Meetin/Top.vue";
import Sidebar from "../components/Meetin/Sidebar.vue";
import Content from "../components/Meetin/Content.vue";
import io from 'socket.io-client';
import { inject } from 'vue';
const { RTCPeerConnection, RTCSessionDescription  } = window;

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
        }
      });

      this.socket.on('get-me',async data => {
        if (data.status === 200) {
          this.user = data.data.me;
        }
      });

      this.socket.on('host-joined',async data => {
        if (data.status === 200) {
          this.host = data.data.host;

        }
      });
    }
  },
  async unmounted() {
    await this.disconnect();
  }
}
</script>
