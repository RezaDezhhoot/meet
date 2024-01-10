<template>
  <div  :class="{'full-screen': full}" v-if="user" class="video-tab overflow-y-auto w-full h-[32%] mr-[0.5rem] bg-white rounded-b-[0.5rem]   lg:rounded-[0.5rem]  hidden-mobile">
    <div v-if="Object.entries(this.$store.state.remoteStreams['camera'] ?? {}).length === 0" class="w-full h-full ">
      <div  class="h-full w-full flex justify-center items-center flex-col">
        <div v-if="! loading" class="w-full text-center">
          <span class="text-[#b8b8b8] font-bold">هیج ویدئویی نمایش داده نمی شود</span>
        </div>
        <loader v-else-if="loading"></loader>
      </div>
    </div>
    <div :class="{hidden: Object.entries(this.$store.state.remoteStreams['camera'] ?? {}).length === 0}" class="h-full box-content">
      <div class="grid-container" id="video-grid-container">

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
    }
  },
  updated() {
    const itemCount = Object.entries(this.$store.state.remoteStreams['camera'] ?? {}).length;
    const top = Math.ceil(itemCount / 10);
    const cols =  Math.ceil(itemCount / (top + 1));
    const rows = Math.ceil(itemCount / cols);
    const cols_percent = 100 / cols;
    const rows_percent = 100 / rows;

    let row = "" , col = "";

    for (let  i = 1;i<= rows; i++){
      row += `${rows_percent}% `;
    }
    for (let  i = 1;i<= cols; i++){
      col += `${cols_percent}% `;
    }
    const video_grid = document.getElementById('video-grid-container');
    video_grid.style.gridTemplateColumns = col.trim();
    video_grid.style.gridTemplateRows = row.trim();
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