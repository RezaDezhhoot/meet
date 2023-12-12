<template>
  <header class="flex fixed top-0 left-0 right-0 w-full h-[4.5rem] bg-[#616161] justify-between px-[1.5rem] py-[1rem] z-50">
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
              <img :src="$store.state.logo" alt="لوگو">
            </span>
          </div>

          <div>
            <ul>
              <li>
                <UserHandRising :menu="true" :responsive="true" label="بلند کردن دست" :fill="(user && user.media && user.media.settings.hand_rising) ? '#62dc82' : '#dbdbdb'" width="30" height="30" :socket="socket" :user="user" :show="user && user.media && host && user.user?.id !== host.user?.id" :active="user && user.media && user.media.settings.hand_rising" ></UserHandRising>
              </li>

              <li>
                <UserMicrophone width="30" height="30" :menu="true" :responsive="true" label=" میکروفن" :socket="socket" :user="user" :show="user && user.media && user.media.media.remote.microphone" :active="user && user.media && user.media.media.local.microphone" ></UserMicrophone>
              </li>

              <li>
                <UserCamera :responsive="true" label="دوربین"  :fill=" (user && user.media && user.media.media.local.microphone) ? '#62dc82' : '#dbdbdb'" width="30" height="30" :socket="socket" :user="user" :show="user && user.media && host && user.user?.id === host.user?.id" ></UserCamera>
              </li>
              <li>
                <UserSpeaker  width="30" height="30" :menu="true"  :responsive="true" label=" بلند گو" :user="user" :socket="socket"></UserSpeaker>
              </li>
            </ul>
          </div>
        </div>

        <div class="close-menu hidden btn-menu"></div>
      </div>

      <button class="ml-[1rem]" v-on:click="logout">
        <svg width="30" height="100%" viewBox="0 0 96 96" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="#000000ff">
            <path fill="#ff5b5b" opacity="1.00" d=" M 46.33 8.33 C 48.75 7.01 52.09 9.08 51.95 11.85 C 52.04 22.58 52.04 33.33 51.94 44.06 C 52.15 47.20 48.10 49.24 45.67 47.29 C 43.91 46.16 43.99 43.89 43.98 42.06 C 44.03 32.34 43.98 22.62 44.00 12.90 C 43.84 11.08 44.53 9.08 46.33 8.33 Z" />
            <path fill="#ff5b5b" opacity="1.00" d=" M 32.48 19.56 C 35.84 17.81 39.65 22.30 37.38 25.34 C 35.05 27.76 31.63 28.83 29.25 31.25 C 18.91 40.20 16.99 56.98 25.04 68.04 C 32.20 78.70 47.11 82.97 58.86 77.80 C 69.42 73.54 76.56 62.30 75.96 50.93 C 75.69 40.70 69.24 31.25 60.17 26.69 C 56.08 24.85 58.48 18.18 62.82 19.31 C 78.16 25.69 87.09 43.92 83.06 60.01 C 79.62 76.29 63.70 88.73 47.04 87.95 C 30.01 87.82 14.48 73.97 12.38 57.07 C 9.96 41.94 18.54 25.91 32.48 19.56 Z" />
          </g>
        </svg>
      </button>

      <button class="flex text-[1rem] justify-center items-center text-[#ffffff]">
        <span class="title-site">{{ room.title }}</span>

      </button>

<!--      <Recorder :user="user" :host="host" :room="room" />-->
    </div>

    <div class="flex items-center">
      <div class="flex ml-[2rem] hidden-mobile">
        <UserHandRising  :border="true" :fill="(user.media && user.media.settings.hand_rising) ? '#62dc82' : '#dbdbdb'" width="20" height="20" :socket="socket" :user="user" :show="user && host && user.user?.id !== host.user?.id" :active="user.media && user.media.settings?.hand_rising" ></UserHandRising>
        <UserCamera :fill=" (user.media && user.media.media.local.microphone) ? '#62dc82' : '#dbdbdb'" width="25" height="25" :socket="socket" :user="user" :show="user && host && user.user?.id === host.user?.id" ></UserCamera>
        <UserMicrophone width="25" height="25" :menu="true" :socket="socket" :user="user" :show="user.media && user.media.media.remote.microphone" :active="user.media && user.media.media.local.microphone" ></UserMicrophone>
        <UserSpeaker  width="25" height="25"  :user="user" :socket="socket"></UserSpeaker>
      </div>

      <div>
        <span class="text-[1.9rem] text-white font-black">
          <img :src="$store.state.logo" alt="لوگو">
        </span>
      </div>
    </div>
  </header>
</template>

<script>

import UserMicrophone from "./Elements/UserMicrophone.vue";
import UserSpeaker from "./Elements/UserSpeaker.vue";
import UserHandRising from "./Elements/UserHandRising.vue";
import UserCamera from "./Elements/UserCamera.vue";
import Recorder from "./Recorder.vue";

export default {
  name: "Top",
  components: {
    UserMicrophone , UserSpeaker , UserHandRising , UserCamera ,Recorder
  },
  props:{
    user: Object,
    host: Object,
    room: Object,
    socket: Object,
  },
  async mounted(){
    this.wires();
  },
  methods:{
    logout(){
      this.$emit('logout');
    },
    wires(){

    }
  }
}
</script>