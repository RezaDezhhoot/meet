<template>
  <header class="flex fixed top-0 left-0 right-0 w-full h-[4.5rem] bg-[#616161]  px-[1.5rem] py-[1rem] z-50">
    <div class="flex">
      <button class="btn-menu justify-center items-center hide-pc">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 10H7C9 10 10 9 10 7V5C10 3 9 2 7 2H5C3 2 2 3 2 5V7C2 9 3 10 5 10Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 10H19C21 10 22 9 22 7V5C22 3 21 2 19 2H17C15 2 14 3 14 5V7C14 9 15 10 17 10Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 22H19C21 22 22 21 22 19V17C22 15 21 14 19 14H17C15 14 14 15 14 17V19C14 21 15 22 17 22Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 22H7C9 22 10 21 10 19V17C10 15 9 14 7 14H5C3 14 2 15 2 17V19C2 21 3 22 5 22Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="menu">
        <div class="show-menu">
          <div class="flex justify-center mt-[1rem]">
            <span class="text-[1.9rem] text-black font-black">
              <img style="max-width: 3rem" :src="$store.state.logo" alt="لوگو">
            </span>
          </div>

          <div>
            <ul v-if="user && user.hasOwnProperty('user') && user.media && host">
              <li>
                <UserHandRising
                    :menu="true"
                    :responsive="true"
                    label="بلند کردن دست"
                    title="بلند کردن دست"
                    :fill="user.media.settings.hand_rising ? '#62dc82' : '#dbdbdb'"
                    width="30"
                    height="30"
                    :user="user"
                    :show="user.user.id !== host.id"
                    :active="user.media.settings.hand_rising">
                </UserHandRising>
              </li>
              <li>
                <UserMicrophone
                    :menu="true"
                    :responsive="true"
                    label="میکروفن"
                    title="میکروفون"
                    width="30"
                    height="30"
                    :user="user"
                    :show="user.media.media.remote.microphone"
                    :active="user.media.media.remote.microphone && user.media.media.local.microphone">
                </UserMicrophone>
              </li>
              <li>
                <OtherCamera
                    :menu="true"
                    :responsive="true"
                    label=" دوربین"
                    width="30"
                    height="30"
                    :user="user"
                    :show="user.media.media.remote.camera"
                    title="دوربین"
                    :active="user.media.media.remote.camera && user.media.media.local.camera">
                </OtherCamera>
              </li>
              <li>
                <UserSpeaker
                    width="30"
                    height="30"
                    :menu="true"
                    :responsive="true"
                    title="بلندگو"
                    label=" بلند گو"
                    :user="user">
                </UserSpeaker>
              </li>
            </ul>
          </div>
        </div>

        <div class="close-menu hidden btn-menu"></div>
      </div>
      <div class="flex text-[1rem] justify-center items-center ml-5">
        <span class="text-[1.9rem] text-white font-black">
          <img style="max-width: 3rem" :src="$store.state.logo" alt="لوگو">
        </span>
      </div>

      <button class="flex text-[1rem] justify-center items-center text-[#ffffff]">
        <span class="title-site">{{ room.title }}</span>

      </button>
      <Recorder  />
      <div class="flex text-[1rem] justify-center items-center mr-10">
        <span id="clock" class="text-[1.3rem] text-white font-black">
        </span>
      </div>
    </div>
    <div class="flex items-center mx-auto">
      <div class="wifi-icon2">
        <template v-if="ping >= 4">
          <div v-for="i in 5 - ping" :class="'wifi-bar bar-'+(ping + i)"></div>
          <div v-for="i in ping" :class="'wifi-bar-ok bar-'+(ping + 1 - i)"></div>
        </template>
        <template v-else-if="ping >= 3">
          <div v-for="i in 5 - ping" :class="'wifi-bar bar-'+(5 - i + 1)"></div>
          <div v-for="i in ping" :class="'wifi-bar-week bar-'+(ping + 1 - i)"></div>
        </template>
        <template v-else-if="ping >= 1">
          <div v-for="i in 5 - ping" :class="'wifi-bar bar-'+(5 - i + 1)"></div>
          <div v-for="i in ping" :class="'wifi-bar-bad bar-'+(ping + 1 - i)"></div>
        </template>
        <template v-else>
          <div v-for="i in 5 " :class="'wifi-bar bar-'+i"></div>
        </template>
      </div>
      <div class="flex ml-[10rem] hidden-mobile" v-if="user && user.hasOwnProperty('user') && user.media && host">
        <button title="اشتراک گزاری" @click="updateContent" class="mx-2">
          <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="#000000ff">
              <path :fill="content ? '#62dc82' : '#aaaaaa'" opacity="1.00" d=" M 8.37 19.94 C 8.16 14.79 12.80 10.25 17.92 10.44 C 39.30 10.37 60.68 10.38 82.05 10.43 C 87.18 10.23 91.81 14.76 91.62 19.91 C 91.72 34.27 91.67 48.63 91.65 62.99 C 91.94 67.85 88.02 72.58 83.08 72.81 C 76.92 73.14 70.75 72.83 64.58 72.94 C 64.58 76.40 64.58 79.87 64.58 83.34 C 67.48 83.37 70.43 83.03 73.29 83.66 C 76.24 84.87 75.11 89.80 71.89 89.52 C 58.28 89.75 44.66 89.49 31.04 89.64 C 29.23 89.46 26.91 90.00 25.61 88.38 C 24.38 86.90 24.96 84.42 26.73 83.65 C 29.58 83.05 32.52 83.36 35.42 83.34 C 35.42 79.87 35.42 76.40 35.42 72.94 C 29.27 72.83 23.11 73.14 16.97 72.82 C 12.05 72.62 8.08 67.95 8.35 63.09 C 8.33 48.71 8.29 34.32 8.37 19.94 M 16.14 17.10 C 14.33 18.02 14.69 20.33 14.55 22.01 C 14.65 35.65 14.48 49.30 14.63 62.94 C 14.19 65.52 16.67 67.02 18.95 66.66 C 39.32 66.69 59.68 66.63 80.05 66.69 C 81.39 66.57 82.91 66.80 84.11 66.07 C 85.77 64.94 85.25 62.68 85.45 60.97 C 85.32 47.30 85.55 33.62 85.35 19.96 C 85.58 17.49 83.09 16.42 81.01 16.67 C 61.01 16.64 41.01 16.72 21.00 16.63 C 19.38 16.68 17.69 16.55 16.14 17.10 M 41.67 72.94 C 41.67 76.40 41.67 79.87 41.67 83.33 C 47.22 83.33 52.78 83.33 58.33 83.33 C 58.33 79.87 58.33 76.40 58.33 72.93 C 52.78 72.93 47.22 72.93 41.67 72.94 Z" />
            </g>
          </svg>
        </button>

        <button title="کاربران" @click="controlUserBox" class="mx-2">
          <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="#000000ff">
              <path :fill="showUserBox ? '#62dc82' : '#aaaaaa'" opacity="1.00" d=" M 46.44 8.64 C 56.42 6.70 67.10 13.24 69.88 23.01 C 72.43 30.88 69.66 40.09 63.21 45.26 C 56.96 50.52 47.53 51.49 40.34 47.61 C 33.23 43.97 28.65 35.98 29.21 28.00 C 29.55 18.57 37.14 10.10 46.44 8.64 Z" />
              <path :fill="showUserBox ? '#62dc82' : '#aaaaaa'" opacity="1.00" d=" M 23.38 58.53 C 40.26 58.07 57.19 58.47 74.09 58.33 C 78.20 57.98 82.42 60.79 83.12 64.96 C 83.81 70.13 83.23 75.81 79.98 80.08 C 75.79 85.66 69.08 88.63 62.47 90.23 C 52.77 92.44 42.42 92.15 32.99 88.92 C 27.36 86.92 21.86 83.52 18.87 78.17 C 16.73 74.53 16.42 70.14 16.73 66.01 C 16.90 62.39 19.80 59.11 23.38 58.53 Z" />
            </g>
          </svg>
        </button>
        <button title="گفتوگو" @click="controlChatBox" class="mx-2">
          <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="#000000ff">
              <path :fill="showChatBox ? '#62dc82' : '#aaaaaa'" opacity="1.00" d=" M 16.46 13.66 C 19.13 12.44 22.13 12.52 25.00 12.51 C 37.33 12.61 49.67 12.44 62.00 12.59 C 68.99 12.62 75.06 18.95 74.95 25.91 C 75.04 33.63 75.04 41.35 74.95 49.06 C 75.02 55.49 69.90 61.45 63.52 62.29 C 54.13 63.00 44.66 62.09 35.28 62.73 C 28.81 67.00 22.80 71.95 16.35 76.25 C 13.19 78.65 8.19 75.93 8.39 72.01 C 8.25 57.00 8.37 41.97 8.34 26.95 C 8.03 21.39 11.30 15.85 16.46 13.66 Z" />
              <path :fill="showChatBox ? '#62dc82' : '#aaaaaa'" opacity="1.00" d=" M 79.09 50.02 C 79.33 43.03 79.04 36.03 79.23 29.04 C 86.07 29.89 91.90 35.90 91.64 42.95 C 91.64 58.28 91.76 73.61 91.59 88.94 C 91.61 92.61 86.99 95.14 83.92 93.08 C 77.31 88.77 71.27 83.58 64.61 79.35 C 55.43 78.85 46.19 79.56 37.00 79.03 C 33.12 78.79 29.92 76.31 27.36 73.58 C 30.46 71.19 33.64 68.92 36.83 66.66 C 45.25 66.64 53.66 66.74 62.07 66.63 C 70.90 66.54 78.82 58.86 79.09 50.02 Z" />
            </g>
          </svg>
        </button>
        <UserHandRising
            width="20"
            height="20"
            title="بلند کردن دست"
            :border="true"
            :fill="user.media.settings.hand_rising ? '#62dc82' : '#dbdbdb'"
            :user="user"
            :show="user.user.id !== host.id"
            :active="user.media.settings.hand_rising">
        </UserHandRising>

        <OtherCamera
            width="25"
            height="25"
            :menu="true"
            :user="user"
            title="دوربین"
            :isUser="user.user.id !== host.id"
            :show="user.media.media.remote.camera"
            :active="user.media.media.remote.camera && user.media.media.local.camera">
        </OtherCamera>

        <UserMicrophone
            width="25"
            height="25"
            :menu="true"
            :user="user"
            title="میکروفون"
            :show="user.media.media.remote.microphone"
            :active="user.media.media.remote.microphone && user.media.media.local.microphone">
        </UserMicrophone>

        <UserSpeaker
            width="25"
            height="25"
            title="بلندگو"
            :user="user">
        </UserSpeaker>

        <button class="ml-[1rem]" v-on:click="logout">
          <svg width="30" height="100%" viewBox="0 0 96 96" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="#000000ff">
              <path fill="#ff5b5b" opacity="1.00" d=" M 46.33 8.33 C 48.75 7.01 52.09 9.08 51.95 11.85 C 52.04 22.58 52.04 33.33 51.94 44.06 C 52.15 47.20 48.10 49.24 45.67 47.29 C 43.91 46.16 43.99 43.89 43.98 42.06 C 44.03 32.34 43.98 22.62 44.00 12.90 C 43.84 11.08 44.53 9.08 46.33 8.33 Z" />
              <path fill="#ff5b5b" opacity="1.00" d=" M 32.48 19.56 C 35.84 17.81 39.65 22.30 37.38 25.34 C 35.05 27.76 31.63 28.83 29.25 31.25 C 18.91 40.20 16.99 56.98 25.04 68.04 C 32.20 78.70 47.11 82.97 58.86 77.80 C 69.42 73.54 76.56 62.30 75.96 50.93 C 75.69 40.70 69.24 31.25 60.17 26.69 C 56.08 24.85 58.48 18.18 62.82 19.31 C 78.16 25.69 87.09 43.92 83.06 60.01 C 79.62 76.29 63.70 88.73 47.04 87.95 C 30.01 87.82 14.48 73.97 12.38 57.07 C 9.96 41.94 18.54 25.91 32.48 19.56 Z" />
            </g>
          </svg>
        </button>

      </div>
    </div>

  </header>
</template>

<script>

import UserMicrophone from "./Elements/UserMicrophone.vue";
import OtherCamera from "./Elements/OtherCamera.vue";
import UserSpeaker from "./Elements/UserSpeaker.vue";
import UserHandRising from "./Elements/UserHandRising.vue";
import Recorder from "./Recorder.vue";

export default {
  name: "Top",
  components: {
    UserMicrophone , UserSpeaker , UserHandRising ,Recorder , OtherCamera
  },
  mounted() {
    this.startTime()
  },
  props: {
    ping: 1
  },
  computed: {
    room(){
      return this.$store.state.room;
    },
    user() {
      return this.$store.state.user;
    },
    hostClient() {
      return this.$store.state.hostClient;
    },
    host() {
      return this.$store.state.host;
    },
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
  methods:{
    logout(){
      this.$emit('logout');
    },
    controlUserBox(){
      this.$store.commit('controlUserBox',! this.showUserBox);
    },
    controlChatBox(){
      this.$store.commit('controlChatBox',! this.showChatBox);
    },
    updateContent() {
      this.$store.commit('setMainContent',! this.content);
    },
    startTime() {
      const today = new Date();
      let h = today.getHours();
      let m = today.getMinutes();
      m = this.checkTime(m);
      document.getElementById('clock').innerHTML =  h + ":" + m ;
      setTimeout(this.startTime, 1000);
    },
    checkTime(i) {
      if (i < 10) {i = "0" + i}
      return i;
    }
  }
}
</script>