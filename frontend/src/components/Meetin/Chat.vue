<template>
  <div class="chat-tab w-full h-[32%] mr-[0.5rem] bg-white rounded-b-[0.5rem] lg:rounded-[0.5rem] px-[1.2rem] py-[1rem]">
    <div class="flex w-full justify-between border-b-[1px] border-[#aaaaaa] h-[2rem] mb-[0.5rem]">
      <div class="text-[#616161] font-bold flex justify-center items-center pb-[0.5rem]">
        <div class="flex justify-center items-center box-mini-menu">
          <div class="close-mini-menu hidden"></div>
        </div>

        <span class="mx-[0.5rem]">گفت و گو</span>
      </div>

      <div class="flex text-[#616161] font-bold">
        <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="#000000ff">
            <path fill="#aaaaaa" opacity="1.00" d=" M 16.46 13.66 C 19.13 12.44 22.13 12.52 25.00 12.51 C 37.33 12.61 49.67 12.44 62.00 12.59 C 68.99 12.62 75.06 18.95 74.95 25.91 C 75.04 33.63 75.04 41.35 74.95 49.06 C 75.02 55.49 69.90 61.45 63.52 62.29 C 54.13 63.00 44.66 62.09 35.28 62.73 C 28.81 67.00 22.80 71.95 16.35 76.25 C 13.19 78.65 8.19 75.93 8.39 72.01 C 8.25 57.00 8.37 41.97 8.34 26.95 C 8.03 21.39 11.30 15.85 16.46 13.66 Z" />
            <path fill="#aaaaaa" opacity="1.00" d=" M 79.09 50.02 C 79.33 43.03 79.04 36.03 79.23 29.04 C 86.07 29.89 91.90 35.90 91.64 42.95 C 91.64 58.28 91.76 73.61 91.59 88.94 C 91.61 92.61 86.99 95.14 83.92 93.08 C 77.31 88.77 71.27 83.58 64.61 79.35 C 55.43 78.85 46.19 79.56 37.00 79.03 C 33.12 78.79 29.92 76.31 27.36 73.58 C 30.46 71.19 33.64 68.92 36.83 66.66 C 45.25 66.64 53.66 66.74 62.07 66.63 C 70.90 66.54 78.82 58.86 79.09 50.02 Z" />
          </g>
        </svg>
      </div>
    </div>

    <div class="box-sidbar-chats" id="chat-box">
      <ul >
        <li v-for="(chat) in this.messages">
          <span>{{ chat.sender }}</span>

          <span class="mx-[0.5rem]">:</span>

          <div class="message">
            <p>{{ chat.text }}</p>
          </div>
        </li>
      </ul>
    </div>
    <form @submit.prevent="sendMessage">
      <div class="box-send-message">
        <input type="text" v-on:focusin="typing" v-on:focusout="disableTyping" v-model="message" placeholder="اینجا بنویسید">

        <button type="submit">
          <svg width="25" height="25" viewBox="0 0 344 344" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="#000000ff">
              <path fill="#4879ff" opacity="1.00" d=" M 35.38 29.50 C 39.51 27.52 43.97 29.44 47.65 31.49 C 132.99 74.14 218.32 116.83 303.66 159.49 C 307.58 161.55 312.45 163.10 314.34 167.51 C 316.91 172.76 314.25 179.52 308.95 181.84 C 220.92 225.88 132.89 269.93 44.82 313.90 C 39.90 316.78 32.96 315.05 30.18 310.02 C 28.26 306.94 28.33 303.03 29.74 299.77 C 42.06 268.06 54.32 236.33 66.61 204.61 C 67.63 202.05 68.44 199.39 69.82 197.00 C 71.54 194.18 74.66 192.46 77.89 192.10 C 112.94 186.49 147.96 180.66 183.01 175.05 C 184.70 174.86 187.22 174.31 186.63 172.00 C 187.23 169.70 184.71 169.13 183.02 168.95 C 147.96 163.35 112.94 157.51 77.88 151.90 C 73.63 151.50 69.90 148.49 68.57 144.44 C 56.10 112.26 43.65 80.08 31.17 47.91 C 30.01 44.74 28.25 41.50 28.77 38.01 C 29.21 34.24 31.87 30.90 35.38 29.50 Z" />
            </g>
          </svg>
        </button>
      </div>
    </form>
   <template v-if="Object.entries(typists).length > 0">
     <small class="text-muted">
       {{ Object.entries(typists).length === 1 ? `${Object.values(typists)[0].name} در حال نوشتن...` : `${Object.entries(typists).length} نفر در حال نوشتن...` }}
     </small>
   </template>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Chat",
  props:{
    clients: Array,
    room: Object,
    host: null,
  },
  data(){
    return {
      message: null,
      typists: [],
      messages:[]
    }
  },
  computed: {
    socket() {
      return this.$store.state.socket;
    },
    user() {
      return this.$store.state.user;
    }
  },
  created() {
    this.wires();
  },
  mounted() {
    this.loadOldChats();
  },
  updated() {
    this.$nextTick(() => {
      this.scrollToBottom();
    });
  },
  methods:{
    loadOldChats(){
      axios.get(`/v1/chats?room=${this.$route.params.key}`).then(res => {
        this.messages = res.data.data.chats.reverse();
      }).catch(err => {
      });
    },
    scrollToBottom() {
      const chatMessages = document.getElementById('chat-box');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    typing(){
      this.socket.emit('typing',{
        name: this.user.name
      });
    },
    disableTyping(){
      this.socket.emit('no-typing');
    },
    sendMessage(){
      if (this.message && this.message.length > 0 && this.message.length <= 100 && typeof this.message === 'string') {
        this.socket.emit('new-message',{
          message: this.message
        });
        this.message = null;
      }
    },
    wires() {
      this.socket.on('get-typists',async data => {
        if (data.status === 200) {
          this.typists = data.data.typistUsers;
          delete this.typists[this.socket.id]
        }
      });

      this.socket.on('get-new-message',async data => {
        if (data.status === 201) {
          this.messages.push(data.data.message);
        }
      });
    }
  }
}
</script>

<style scoped>

</style>