<template>
  <div :class="{'full-screen': (full)}" v-if="user" :style="'height:'+height+'%'" class="video-tab relative mb-2 overflow-y-auto w-full mr-[0.5rem]  bg-white rounded-b-[0.5rem]  lg:rounded-[0.5rem] ">
    <div class="upload-progress"  :style="{ width: progress + '%' }"></div>

    <div class="camera-controller ">
      <div  class="video-controller">
        <ul>
          <li v-on:click="full = ! full">
            <svg v-if="! full" fill="#dbdbdb" width="25px" height="25px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g id="#000000ff">
                <path fill="#fff" opacity="1.00" d=" M 19.36 13.49 C 24.69 11.75 30.48 12.69 35.99 12.63 C 39.97 12.72 40.94 18.81 37.37 20.36 C 32.34 21.87 26.55 19.45 21.76 21.72 C 19.44 26.51 21.95 32.35 20.34 37.40 C 18.89 40.55 13.77 40.22 12.76 36.90 C 12.22 32.65 12.52 28.33 12.54 24.06 C 12.44 19.57 15.27 15.28 19.36 13.49 Z" />
                <path fill="#fff" opacity="1.00" d=" M 62.28 13.16 C 64.34 12.13 66.77 12.66 68.99 12.50 C 73.93 12.65 79.72 11.65 83.63 15.45 C 89.24 20.33 87.16 28.49 87.46 35.02 C 88.16 39.46 81.45 41.42 79.63 37.37 C 78.30 32.48 80.03 27.20 78.69 22.31 C 78.44 22.06 77.93 21.54 77.68 21.28 C 73.00 20.07 68.07 21.36 63.32 20.60 C 59.98 19.85 59.34 14.83 62.28 13.16 Z" />
                <path fill="#fff" opacity="1.00" d=" M 15.44 60.54 C 17.53 59.85 20.08 61.13 20.61 63.30 C 21.41 68.04 20.11 72.99 21.29 77.67 C 21.54 77.93 22.05 78.44 22.30 78.70 C 26.99 79.94 31.95 78.63 36.72 79.40 C 39.38 80.05 40.51 83.65 38.83 85.78 C 37.28 88.00 34.29 87.41 31.96 87.57 C 26.55 87.40 20.06 88.53 15.93 84.13 C 11.43 80.00 12.65 73.43 12.46 67.98 C 12.43 65.30 12.15 61.43 15.44 60.54 Z" />
                <path fill="#fff" opacity="1.00" d=" M 82.40 60.47 C 85.10 59.76 87.84 62.24 87.47 65.00 C 87.14 71.34 89.16 79.06 84.13 84.06 C 79.99 88.54 73.42 87.40 67.95 87.57 C 65.64 87.42 62.64 87.98 61.14 85.74 C 59.48 83.60 60.65 80.02 63.31 79.40 C 68.06 78.63 73.02 79.95 77.70 78.69 C 80.20 76.64 78.85 72.86 79.17 70.05 C 79.29 66.77 78.09 61.52 82.40 60.47 Z" />
              </g>
            </svg>
            <svg v-else fill="#dbdbdb" width="25px" height="25px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                 viewBox="0 0 385.331 385.331" xml:space="preserve">
            <g>
              <g id="Fullscreen_Exit">
                <path fill="#fff" d="M264.943,156.665h108.273c6.833,0,11.934-5.39,11.934-12.211c0-6.833-5.101-11.85-11.934-11.838h-96.242V36.181
                  c0-6.833-5.197-12.03-12.03-12.03s-12.03,5.197-12.03,12.03v108.273c0,0.036,0.012,0.06,0.012,0.084
                  c0,0.036-0.012,0.06-0.012,0.096C252.913,151.347,258.23,156.677,264.943,156.665z"/>
                <path fill="#fff" d="M120.291,24.247c-6.821,0-11.838,5.113-11.838,11.934v96.242H12.03c-6.833,0-12.03,5.197-12.03,12.03
                  c0,6.833,5.197,12.03,12.03,12.03h108.273c0.036,0,0.06-0.012,0.084-0.012c0.036,0,0.06,0.012,0.096,0.012
                  c6.713,0,12.03-5.317,12.03-12.03V36.181C132.514,29.36,127.124,24.259,120.291,24.247z"/>
                <path fill="#fff" d="M120.387,228.666H12.115c-6.833,0.012-11.934,5.39-11.934,12.223c0,6.833,5.101,11.85,11.934,11.838h96.242v96.423
                  c0,6.833,5.197,12.03,12.03,12.03c6.833,0,12.03-5.197,12.03-12.03V240.877c0-0.036-0.012-0.06-0.012-0.084
                  c0-0.036,0.012-0.06,0.012-0.096C132.418,233.983,127.1,228.666,120.387,228.666z"/>
                <path fill="#fff" d="M373.3,228.666H265.028c-0.036,0-0.06,0.012-0.084,0.012c-0.036,0-0.06-0.012-0.096-0.012
                  c-6.713,0-12.03,5.317-12.03,12.03v108.273c0,6.833,5.39,11.922,12.223,11.934c6.821,0.012,11.838-5.101,11.838-11.922v-96.242
                  H373.3c6.833,0,12.03-5.197,12.03-12.03S380.134,228.678,373.3,228.666z"/>
              </g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
              <g></g>
            </g>
          </svg>
          </li>
        </ul>
      </div>
    </div>
<!--    <div :class="{hidden: Object.entries(cameras).length > 0}" class="flex items-center h-full w-full justify-center">-->
<!--    </div>-->
    <div id="outer-box" class="h-full  outer-box text-center">
      <div class="h-full empty-video w-full flex justify-center items-center">
        <span  class="text-[#b8b8b8] font-bold">هیج ویدئویی نمایش داده نمی شود</span>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from "@/components/Meetin/Elements/Loader.vue";

export default {
  name: "Camera",
  data(){
    return {
      hiddenVideo: true,
      localStream: null,
      showDropdown: false,
      selectedOption: null,
      shouldConfirmLeave: true,
      full: false,
    }
  },
  props:{
    height: 32,
  },
  components:{
    loader: Loader
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    room(){
      return this.$store.state.room;
    },
    loading() {
      return this.$store.state.cameraLoading;
    },
    cameras() {
      return this.$store.state.remoteStreams['camera'] ?? {}
    },
    progress(){
      return this.$store.state.progress;
    }
  },
  mounted() {
    this.$store.dispatch('setDynamicGrid' , true)
  },
}
</script>

<style>
.grid-container {
  display: grid;
  height: 100%;
  max-height: 100%;
  box-sizing: border-box;
}

.grid-item {
  font-size: 30px;
  padding: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-item video{
  border-radius: 5px;
  object-fit: unset;
}
</style>