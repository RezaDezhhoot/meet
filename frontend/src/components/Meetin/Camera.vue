<template>
  <div  :class="{'full-screen': (full)}" v-if="user" :style="'height:'+height+'%'" class="video-tab  overflow-y-auto w-full mr-[0.5rem]  bg-white rounded-b-[0.5rem]  lg:rounded-[0.5rem] ">
    <div :class="{hidden: Object.entries(cameras).length > 0}" class="flex items-center h-full w-full justify-center">
      <span  class="text-[#b8b8b8] font-bold">هیج ویدئویی نمایش داده نمی شود</span>
    </div>
    <div :class="{hidden: Object.entries(cameras).length === 0}" class="h-full  outer-box text-center">
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
    }
  },
  beforeCreate() {
    this.$store.state.socket.on('disconnect' , async data => {
      if (this.$store.state.videoStream) {
        // this.reConnectVideo();
      }
    })
  },
  mounted() {
    this.$store.dispatch('setDynamicGrid')
  },
  methods:{
    reConnectVideo() {
      this.$store.dispatch('videoShare',{
        media: ['camera'],localStream: this.$store.state.videoStream
      });
    },
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