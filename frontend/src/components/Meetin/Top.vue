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
            <span class="text-[1.9rem] text-black font-black">LOGO</span>
          </div>

          <div>
            <ul>
              <li>
                <UserHandRising :responsive="true" label="بلند کردن دست" :fill="(user.media && user.media.settings.hand_rising) ? '#62dc82' : '#dbdbdb'" width="30" height="30" :socket="socket" :user="user" :show="user && host && user.user?.id !== host.user.id" :active="user.media && user.media.settings.hand_rising" ></UserHandRising>
              </li>

              <li>
                <UserMicrophone :responsive="true" label="دسترسی میکروفن" :fill="(user.media && user.media.media.local.microphone) ? '#62dc82' : '#dbdbdb'" width="30" height="30" :socket="socket" :user="user" :show="user.media && user.media.media.remote.microphone" :active="user.media && user.media.media.local.microphone" ></UserMicrophone>
              </li>

              <li>
                <button class="camera mx-[1rem] flex my-[1rem]">
                  <svg width="30" height="30" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <g id="#000000ff">
                      <path fill="#dbdbdb" opacity="1.00" d=" M 17.35 19.57 C 20.46 18.54 23.79 18.74 27.01 18.71 C 35.68 18.82 44.36 18.62 53.03 18.78 C 57.71 18.76 62.31 21.25 64.68 25.30 C 66.53 28.16 66.71 31.67 66.69 34.97 C 66.60 45.94 66.76 56.90 66.62 67.87 C 66.57 72.42 64.12 76.87 60.20 79.21 C 56.58 81.58 52.07 81.26 47.94 81.29 C 38.99 81.14 30.03 81.47 21.09 81.15 C 14.25 80.94 8.36 74.81 8.38 67.98 C 8.30 56.00 8.30 44.02 8.38 32.05 C 8.40 26.53 12.15 21.36 17.35 19.57 Z" />
                      <path fill="#dbdbdb" opacity="1.00" d=" M 84.74 28.79 C 86.41 27.92 88.46 26.26 90.33 27.65 C 91.80 28.58 91.59 30.48 91.69 31.97 C 91.65 43.99 91.66 56.01 91.69 68.03 C 91.69 69.73 91.65 71.99 89.73 72.69 C 87.92 73.42 86.32 71.99 84.80 71.23 C 80.17 68.39 75.52 65.57 70.84 62.80 C 70.83 54.26 70.82 45.73 70.84 37.20 C 75.50 34.43 80.14 31.64 84.74 28.79 Z" />
                    </g>
                  </svg>

                  <span class="mr-[0.5rem] mt-[0.15rem]">دسترسی دوربین</span>
                </button>
              </li>
              <li>
                <UserSpeaker  :responsive="true" label="دسترسی بلند گو" width="30" height="30" :user="user" :socket="socket"></UserSpeaker>
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

      <Recorder :user="user" :host="host" :room="room" />
    </div>

    <div class="flex">
      <div class="flex ml-[3rem] hidden-mobile">
        <UserHandRising :border="true" :fill="(user.media && user.media.settings.hand_rising) ? '#62dc82' : '#dbdbdb'" width="24" height="24" :socket="socket" :user="user" :show="user && host && user.user?.id !== host.user.id" :active="user.media && user.media.settings.hand_rising" ></UserHandRising>
        <UserCamera :fill=" (user.media && user.media.media.local.microphone) ? '#62dc82' : '#dbdbdb'" width="30" height="30" :socket="socket" :user="user" :show="user && host && user.user?.id === host.user.id" ></UserCamera>
        <UserMicrophone :fill=" (user.media && user.media.media.local.microphone) ? '#62dc82' : '#dbdbdb'" width="30" height="30" :socket="socket" :user="user" :show="user.media && user.media.media.remote.microphone" :active="user.media && user.media.media.local.microphone" ></UserMicrophone>
        <UserSpeaker  width="30" height="30"  :user="user" :socket="socket"></UserSpeaker>
      </div>

      <div>
        <span class="text-[1.9rem] text-white font-black">LOGO</span>
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
  methods:{
    logout(){
      this.$emit('logout');
    }
  }
}
</script>