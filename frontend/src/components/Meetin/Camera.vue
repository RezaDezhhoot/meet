<template>
  <div class="video-tab w-full h-[32%] mr-[0.5rem] bg-white rounded-b-[0.5rem] lg:rounded-[0.5rem] px-[1.2rem] py-[1rem] hidden-mobile">



    <div v-if="hiddenVideo" class="w-full h-full">
      <div class="flex w-full justify-between border-b-[1px] border-[#aaaaaa]">
        <div class="text-[#616161] font-bold flex justify-center items-center pb-[0.5rem]">
          <div class="flex justify-center items-center box-mini-menu">
            <div class="close-mini-menu hidden"></div>
          </div>
          <span class="ml-[0.5rem]">ویدئو</span>
        </div>

        <div class="flex text-[#616161] font-bold">
          <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="#000000ff">
              <path fill="#aaaaaa" opacity="1.00" d=" M 17.35 19.57 C 20.46 18.54 23.79 18.74 27.01 18.71 C 35.68 18.82 44.36 18.62 53.03 18.78 C 57.71 18.76 62.31 21.25 64.68 25.30 C 66.53 28.16 66.71 31.67 66.69 34.97 C 66.60 45.94 66.76 56.90 66.62 67.87 C 66.57 72.42 64.12 76.87 60.20 79.21 C 56.58 81.58 52.07 81.26 47.94 81.29 C 38.99 81.14 30.03 81.47 21.09 81.15 C 14.25 80.94 8.36 74.81 8.38 67.98 C 8.30 56.00 8.30 44.02 8.38 32.05 C 8.40 26.53 12.15 21.36 17.35 19.57 Z" />
              <path fill="#aaaaaa" opacity="1.00" d=" M 84.74 28.79 C 86.41 27.92 88.46 26.26 90.33 27.65 C 91.80 28.58 91.59 30.48 91.69 31.97 C 91.65 43.99 91.66 56.01 91.69 68.03 C 91.69 69.73 91.65 71.99 89.73 72.69 C 87.92 73.42 86.32 71.99 84.80 71.23 C 80.17 68.39 75.52 65.57 70.84 62.80 C 70.83 54.26 70.82 45.73 70.84 37.20 C 75.50 34.43 80.14 31.64 84.74 28.79 Z" />
            </g>
          </svg>
        </div>
      </div>

      <div class="h-full w-full flex justify-center items-center flex-col">
        <div class="w-full text-center">
          <span v-if="$store.state.updating" class=" text-[#b8b8b8] text-amber-500">
            در حال تغییر منبع...
          </span>
          <span v-else class="text-[#b8b8b8] font-bold">هیج ویدئویی نمایش داده نمی شود</span>
          <template v-if="room.host && user.user && room.host.id === user.user.id">

            <div class="relative mt-[0.5rem]">
              <div class="flex justify-center items-center" v-if="$store.state.videoInputs.length > 0 && ! $store.state.updating">
                <button  @click="toggleDropdown" class="dropdown-btn border-x-2 border-y-2 border-[#d1d1d1] ">&#9662;</button>
                <div v-show="showDropdown" class="dropdown-content">
                  <a v-for="(video , key) in $store.state.videoInputs " @click="selectOption(video.id)">
                    <small>
                      {{ video.id === $store.state.selectedVideoDevice ? '✅' : '' }} {{video.label}}
                    </small>
                    <hr>
                  </a>
                </div>
                <button v-on:click="shareCamera" class="flex text-[#616161] border-l-2 border-y-2 border-[#d1d1d1] rounded-l-lg justify-center items-center">
                  <div  class="flex px-[0.5rem] py-[0.4rem] ">
                    <span class="font-bold text-[#616161] px-[0.8rem]">نمایش ویدئوی من</span>

                    <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <g id="#000000ff">
                        <path fill="#df1111" opacity="1.00" d=" M 17.35 19.57 C 20.46 18.54 23.79 18.74 27.01 18.71 C 35.68 18.82 44.36 18.62 53.03 18.78 C 57.71 18.76 62.31 21.25 64.68 25.30 C 66.53 28.16 66.71 31.67 66.69 34.97 C 66.60 45.94 66.76 56.90 66.62 67.87 C 66.57 72.42 64.12 76.87 60.20 79.21 C 56.58 81.58 52.07 81.26 47.94 81.29 C 38.99 81.14 30.03 81.47 21.09 81.15 C 14.25 80.94 8.36 74.81 8.38 67.98 C 8.30 56.00 8.30 44.02 8.38 32.05 C 8.40 26.53 12.15 21.36 17.35 19.57 Z" />
                        <path fill="#df1111" opacity="1.00" d=" M 84.74 28.79 C 86.41 27.92 88.46 26.26 90.33 27.65 C 91.80 28.58 91.59 30.48 91.69 31.97 C 91.65 43.99 91.66 56.01 91.69 68.03 C 91.69 69.73 91.65 71.99 89.73 72.69 C 87.92 73.42 86.32 71.99 84.80 71.23 C 80.17 68.39 75.52 65.57 70.84 62.80 C 70.83 54.26 70.82 45.73 70.84 37.20 C 75.50 34.43 80.14 31.64 84.74 28.79 Z" />
                      </g>
                    </svg>
                  </div>
                </button>
              </div>
              <div v-else-if="!$store.state.updating">
                <p class="text-amber-500">
                  هیچ دوربینی پیدا نشد.
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <video id="video-player" class="h-full video-player rounded-b-[0.5rem] lg:rounded-[0.5rem] w-full" :class="{ 'hidden': hiddenVideo ,'self-media': user.user && host && user.user.id === host.user.id }" muted  ref="localVideo" autoplay>
    </video>
  </div>
</template>

<script>

export default {
  name: "Camera",
  props:{
    clients: Array,
    room: Object,
    socket: Object,
    user: Object,
    host: null,
  },
  data(){
    return {
      hiddenVideo: true,
      localStream: null,
      peerConnections: Object,
      showDropdown: false,
      selectedOption: null,
    }
  },
  created() {
    this.wires();
  },
  watch:{
    "$store.state.hiddenVideo"(value) {
      this.hiddenVideo = value;
    },
    "$store.state.showing"(value) {
      this.hiddenVideo = ! value;
      if (value) {
        this.$refs.localVideo.srcObject = this.$store.state.localStream;
      }
    },
  },
  methods:{
    async shareCamera(){
      this.hiddenVideo = false;
      this.socket.emit('control-local-media',{
        device: 'camera'
      });
      this.$store.dispatch('endStream',{
        media: 'camera'
      });
      this.$store.dispatch('shareStream',{
        video: true , audio: true , media: 'camera'
      });
    },
    wires(){},
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    selectOption(option) {
      this.$store.dispatch('setDefaultDevice',{
        type: 'camera',
        value: option
      });
      this.showDropdown = false;
    },
  }
}
</script>

<style>

</style>