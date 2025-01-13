<template>
  <div >
    <div v-if="! responsive && menu && show" class="flex mx-2 relative align-center">
      <button  @click="showDropdown=!showDropdown" class="dropdown-btn border-x-2 border-y-2 border-[#d1d1d1] text-white">&#9662;</button>
      <div v-show="showDropdown" class="dropdown-content">
        <a v-for="(camera , key) in $store.state.videoInputs " @click="selectOption(camera.id)">
          <small>
            {{ camera.id === $store.state.selectedVideoDevice ? '✔️' : '' }} {{camera.label}}
          </small>
          <hr>
        </a>
      </div>

      <button :title="title" v-on:click="control" :class="{'flex my-[1rem]': responsive }" :disabled="socket.id !== user.socketId" class="mic px-2 rounded-l-lg border-l-2 border-y-2" v-if="show">
        <svg :width="width" :height="height" viewBox="0 0 81.369 81.369" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="#000000ff">
            <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d="M79.155,24.392c-1.313-0.906-3.014-1.149-4.525-0.65l-12.436,3.119v-4.977c0-5.754-4.682-10.436-10.436-10.436H10.436
          C4.682,11.448,0,16.129,0,21.884v37.601c0,5.754,4.681,10.435,10.436,10.435h41.322c5.754,0,10.436-4.681,10.436-10.435v-3.608
          l12.441,3.121c1.523,0.498,3.208,0.252,4.533-0.662c1.378-0.961,2.201-2.536,2.201-4.215V28.617
          C81.37,26.94,80.548,25.365,79.155,24.392z M75.37,52.997l-19.176-4.811v11.3c0,2.445-1.99,4.435-4.436,4.435H10.436
          C7.99,63.921,6,61.932,6,59.486V21.884c0-2.446,1.99-4.436,4.436-4.436h41.322c2.445,0,4.436,1.99,4.436,4.436v12.667l19.176-4.81
          V52.997z" />
            <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d="M45.105,38.207L23.139,25.523c-0.928-0.536-2.072-0.536-3,0s-1.5,1.526-1.5,2.598v25.365c0,1.072,0.572,2.063,1.5,2.598
          c0.464,0.269,0.982,0.402,1.5,0.402s1.036-0.134,1.5-0.402l21.966-12.682c0.929-0.535,1.5-1.525,1.5-2.598
          C46.605,39.733,46.034,38.742,45.105,38.207z M24.639,48.291V33.318l12.966,7.486L24.639,48.291z" />

            <line v-if="! status" x1="0" y1="0" x2="100" y2="100" stroke="red" stroke-width="6" />
          </g>
        </svg>
        <span v-if="label" class="mr-[0.5rem] mt-[0.15rem]">{{ label }}</span>
      </button>
    </div>
    <div v-else-if="responsive && menu && show" class="flex my-2 mx-4 align-center relative border-r-2 rounded-r-lg border-y-2">
      <button v-on:click="control" :title="title" :class="{'flex my-[1rem]': responsive }" :disabled="socket.id !== user.socketId " class="mic px-2 py-1 responsive-action  border-[#d1d1d1]" v-if="show">
        <svg :width="width" :height="height" viewBox="0 0 81.369 81.369" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="#000000ff">
            <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d="M79.155,24.392c-1.313-0.906-3.014-1.149-4.525-0.65l-12.436,3.119v-4.977c0-5.754-4.682-10.436-10.436-10.436H10.436
          C4.682,11.448,0,16.129,0,21.884v37.601c0,5.754,4.681,10.435,10.436,10.435h41.322c5.754,0,10.436-4.681,10.436-10.435v-3.608
          l12.441,3.121c1.523,0.498,3.208,0.252,4.533-0.662c1.378-0.961,2.201-2.536,2.201-4.215V28.617
          C81.37,26.94,80.548,25.365,79.155,24.392z M75.37,52.997l-19.176-4.811v11.3c0,2.445-1.99,4.435-4.436,4.435H10.436
          C7.99,63.921,6,61.932,6,59.486V21.884c0-2.446,1.99-4.436,4.436-4.436h41.322c2.445,0,4.436,1.99,4.436,4.436v12.667l19.176-4.81
          V52.997z" />
            <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d="M45.105,38.207L23.139,25.523c-0.928-0.536-2.072-0.536-3,0s-1.5,1.526-1.5,2.598v25.365c0,1.072,0.572,2.063,1.5,2.598
          c0.464,0.269,0.982,0.402,1.5,0.402s1.036-0.134,1.5-0.402l21.966-12.682c0.929-0.535,1.5-1.525,1.5-2.598
          C46.605,39.733,46.034,38.742,45.105,38.207z M24.639,48.291V33.318l12.966,7.486L24.639,48.291z" />


            <line v-if="! status" x1="0" y1="0" x2="100" y2="100" stroke="red" stroke-width="6" />
          </g>
        </svg>
        <span v-if="label" class="mr-[0.5rem] mt-[0.15rem]">{{ label }}</span>
      </button>
      <button  @click="showDropdown=!showDropdown" style="color:#0c0e1a" class="dropdown-btn  border-x-2 border-y-2 border-[#d1d1d1] text-white">&#9662;</button>
      <div v-show="showDropdown" class="dropdown-content">
        <a v-for="(camera , key) in $store.state.videoInputs " @click="selectOption(camera.id)">
          <small>
            {{ camera.id === $store.state.selectedVideoDevice ? '✔️' : '' }} {{camera.label}}
          </small>
          <hr>
        </a>
      </div>
    </div>
    <div v-else-if="show" class="flex mx-2 relative align-center">
      <button v-on:click="control" :title="title" :class="{'flex my-[1rem]': responsive }" :disabled="socket.id !== user.socketId" class="mic mx-[1rem]" v-if="show">
        <svg :width="width" :height="height" viewBox="0 0 81.369 81.369" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="#000000ff">
            <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d="M79.155,24.392c-1.313-0.906-3.014-1.149-4.525-0.65l-12.436,3.119v-4.977c0-5.754-4.682-10.436-10.436-10.436H10.436
          C4.682,11.448,0,16.129,0,21.884v37.601c0,5.754,4.681,10.435,10.436,10.435h41.322c5.754,0,10.436-4.681,10.436-10.435v-3.608
          l12.441,3.121c1.523,0.498,3.208,0.252,4.533-0.662c1.378-0.961,2.201-2.536,2.201-4.215V28.617
          C81.37,26.94,80.548,25.365,79.155,24.392z M75.37,52.997l-19.176-4.811v11.3c0,2.445-1.99,4.435-4.436,4.435H10.436
          C7.99,63.921,6,61.932,6,59.486V21.884c0-2.446,1.99-4.436,4.436-4.436h41.322c2.445,0,4.436,1.99,4.436,4.436v12.667l19.176-4.81
          V52.997z" />
            <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d="M45.105,38.207L23.139,25.523c-0.928-0.536-2.072-0.536-3,0s-1.5,1.526-1.5,2.598v25.365c0,1.072,0.572,2.063,1.5,2.598
          c0.464,0.269,0.982,0.402,1.5,0.402s1.036-0.134,1.5-0.402l21.966-12.682c0.929-0.535,1.5-1.525,1.5-2.598
          C46.605,39.733,46.034,38.742,45.105,38.207z M24.639,48.291V33.318l12.966,7.486L24.639,48.291z" />
            <line v-if="! status" x1="0" y1="0" x2="100" y2="100" stroke="red" stroke-width="6" />
          </g>
        </svg>
        <span v-if="label" class="mr-[0.5rem] mt-[0.15rem]">{{ label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "OtherCamera",
  props:{
    height: 0,
    width: 0,
    show: false,
    fill: "#dbdbdb",
    user: Object,
    responsive: false,
    label: null,
    menu: false,
    isUser: false,
    title: String,
  },
  data(){
    return {
      status: false,
      socket: Object,
      showDropdown: false,
      disabled: false
    }
  },
  async mounted() {
    this.socket = this.$store.state.socket;
  },
  watch:{
    "$store.state.user.media.media.local.camera"(value){
      this.status = value;
      this.disabled = false
    }
  },
  methods:{
    async control(){
      this.disabled = true
      if (! this.status && this.user && this.user.media && this.user.media.media.remote.camera) {
        this.$store.dispatch('shareStream',{
          media: 'camera',
        });
      } else if (this.user.media.media.remote.camera && this.user.media.media.local.camera) {
        this.$store.dispatch('shareStream',{
          media: 'camera',
        });
        this.status = false;
      }
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

<style scoped>

</style>