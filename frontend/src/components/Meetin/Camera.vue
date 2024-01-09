<template>
  <div  :class="{'full-screen': full}" v-if="user" class="video-tab overflow-y-auto w-full h-[32%] mr-[0.5rem] bg-white rounded-b-[0.5rem]   lg:rounded-[0.5rem]  hidden-mobile">
    <div v-if="videoStreams.length === 0" class="w-full h-full ">
      <div  class="h-full w-full flex justify-center items-center flex-col">
        <div v-if="! loading" class="w-full text-center">
          <span class="text-[#b8b8b8] font-bold">هیج ویدئویی نمایش داده نمی شود</span>
        </div>
        <loader v-else-if="loading"></loader>
      </div>
    </div>
    <div v-else class="h-full box-content">
      <div class="grid-container" id="video-grid-container">
        <div v-for="(item , key) in videoStreams" class="grid-item" :style="`flex-basis: calc(${videoGrid}%);`">
          <video class="h-full w-full" v-bind:id="item" autoplay muted></video>
        </div>
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
      full: false
    }
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
    videoStreams() {
      return Object.entries(this.$store.state.remoteStreams['camera'] ?? {})
    },
    videoGrid()
    {
      // const itemCount = this.videoStreams.length;
      const itemCount = 12  ;
      const top = Math.ceil(itemCount / 10);
      return 100 / Math.ceil(itemCount / (top + 1))
    }
  },
  watch:{
    "$store.state.hiddenVideo"(value) {
      this.hiddenVideo = value;
    },
    "$store.state.showing"(value) {
      this.hiddenVideo = ! value;
    },
    "$store.state.videoStream"(value) {
      if (value) {
        this.$refs.localVideo.srcObject = value;
      }
    }
  },
  methods:{
    async shareCamera(){
      if (this.$store.state.videoStream) {
        this.$store.commit('controlCamera',true);
      } else {
        this.$store.dispatch('shareStream',{
          video: true , audio: false , media: 'camera'
        });
      }
    },
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
.grid-container {
  display: flex;
  flex-wrap: wrap;
  height: auto;
  min-height: 100%;
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