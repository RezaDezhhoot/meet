<template>
  <div v-if="! responsive && menu && show" class="flex md:mx-2 relative align-center">
    <button @click="showDropdown=!showDropdown" class="dropdown-btn border-x-2 border-y-2 border-[#d1d1d1] text-white">&#9662;</button>
    <div v-show="showDropdown" class="dropdown-content">
      <a v-for="(microphone , key) in $store.state.audioInputs " @click="selectOption(microphone.id)">
        <small>
          {{ microphone.id === $store.state.selectedAudioDevice ? '✔️' : '' }} {{microphone.label}}
        </small>
        <hr>
      </a>
    </div>

    <button v-on:click="control" :title="title" :class="{'flex my-[1rem]': responsive }" :disabled="socket.id !== user.socketId" class="mic px-2 rounded-l-lg border-l-2 border-y-2" v-if="show">
      <svg :width="width" :height="height" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="#000000ff">
          <path :fill="fill ? fill : ((status || active) ? '#62dc82' : '#dbdbdb')" opacity="1.00" d=" M 46.49 4.50 C 56.87 2.22 67.92 10.46 68.62 21.07 C 68.94 29.71 68.65 38.35 68.75 46.99 C 68.67 51.78 69.27 56.81 67.30 61.33 C 64.40 68.54 56.67 73.45 48.90 72.87 C 39.64 72.52 31.51 64.35 31.31 55.07 C 31.18 44.36 31.27 33.64 31.26 22.93 C 31.09 14.18 37.88 6.01 46.49 4.50 Z" />
          <path :fill="fill ? fill : ((status || active) ? '#62dc82' : '#dbdbdb')" opacity="1.00" d=" M 18.93 46.06 C 19.38 42.98 24.41 43.04 24.83 46.09 C 25.36 51.02 24.44 56.11 25.94 60.92 C 28.37 70.11 36.55 77.36 45.93 78.80 C 53.29 80.04 61.17 77.79 66.70 72.75 C 71.98 68.08 75.05 61.07 74.98 54.02 C 75.18 51.13 74.58 48.13 75.39 45.32 C 76.52 42.89 80.64 43.35 81.09 46.04 C 81.64 53.67 81.44 61.79 77.64 68.67 C 72.90 77.88 63.37 84.16 53.12 85.33 C 53.05 88.90 53.39 92.48 52.89 96.03 C 51.96 98.57 47.96 98.54 47.09 95.97 C 46.63 92.44 46.94 88.87 46.88 85.33 C 36.40 84.13 26.65 77.58 22.02 68.04 C 18.52 61.30 18.37 53.46 18.93 46.06 Z" />


          <line v-if="! active" x1="0" y1="0" x2="100" y2="100" stroke="red" stroke-width="6" />
        </g>
      </svg>
      <span v-if="label" class="mr-[0.5rem] mt-[0.15rem]">{{ label }}</span>
    </button>
  </div>
  <div v-else-if="responsive && menu && show" class="flex my-6 mx-4 align-center relative border-r-2 rounded-r-lg border-y-2">
    <button v-on:click="control" :title="title"  :class="{'flex my-[1rem]': responsive }" :disabled="socket.id !== user.socketId" class="mic px-2 py-1  responsive-action  border-[#d1d1d1]" v-if="show">
      <svg :width="width" :height="height" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="#000000ff">
          <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d=" M 46.49 4.50 C 56.87 2.22 67.92 10.46 68.62 21.07 C 68.94 29.71 68.65 38.35 68.75 46.99 C 68.67 51.78 69.27 56.81 67.30 61.33 C 64.40 68.54 56.67 73.45 48.90 72.87 C 39.64 72.52 31.51 64.35 31.31 55.07 C 31.18 44.36 31.27 33.64 31.26 22.93 C 31.09 14.18 37.88 6.01 46.49 4.50 Z" />
          <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d=" M 18.93 46.06 C 19.38 42.98 24.41 43.04 24.83 46.09 C 25.36 51.02 24.44 56.11 25.94 60.92 C 28.37 70.11 36.55 77.36 45.93 78.80 C 53.29 80.04 61.17 77.79 66.70 72.75 C 71.98 68.08 75.05 61.07 74.98 54.02 C 75.18 51.13 74.58 48.13 75.39 45.32 C 76.52 42.89 80.64 43.35 81.09 46.04 C 81.64 53.67 81.44 61.79 77.64 68.67 C 72.90 77.88 63.37 84.16 53.12 85.33 C 53.05 88.90 53.39 92.48 52.89 96.03 C 51.96 98.57 47.96 98.54 47.09 95.97 C 46.63 92.44 46.94 88.87 46.88 85.33 C 36.40 84.13 26.65 77.58 22.02 68.04 C 18.52 61.30 18.37 53.46 18.93 46.06 Z" />

          <line v-if="! active" x1="0" y1="0" x2="100" y2="100" stroke="red" stroke-width="6" />
        </g>
      </svg>
      <span v-if="label" class="mr-[0.5rem] mt-[0.15rem]">{{ label }}</span>
    </button>
    <button  @click="showDropdown=!showDropdown" style="color:#0c0e1a" class="dropdown-btn border-x-2 border-y-2 border-[#d1d1d1] text-white">&#9662;</button>
    <div v-show="showDropdown" class="dropdown-content">
      <a v-for="(microphone , key) in $store.state.audioInputs " @click="selectOption(microphone.id)">
        <small>
          {{ microphone.id === $store.state.selectedAudioDevice ? '✔️' : '' }} {{microphone.label}}
        </small>
        <hr>
      </a>
    </div>
  </div>
  <div v-else-if="show" class="flex md:mx-2 relative align-center">
    <button v-on:click="control" :title="title" :class="{'flex my-[1rem]': responsive }" :disabled="socket.id !== user.socketId" class="mic  mr-[0.1rem]" v-if="show">
      <svg :width="width" :height="height" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="#000000ff">
          <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d=" M 46.49 4.50 C 56.87 2.22 67.92 10.46 68.62 21.07 C 68.94 29.71 68.65 38.35 68.75 46.99 C 68.67 51.78 69.27 56.81 67.30 61.33 C 64.40 68.54 56.67 73.45 48.90 72.87 C 39.64 72.52 31.51 64.35 31.31 55.07 C 31.18 44.36 31.27 33.64 31.26 22.93 C 31.09 14.18 37.88 6.01 46.49 4.50 Z" />
          <path :fill="fill ? fill : (status ? '#62dc82' : '#dbdbdb')" opacity="1.00" d=" M 18.93 46.06 C 19.38 42.98 24.41 43.04 24.83 46.09 C 25.36 51.02 24.44 56.11 25.94 60.92 C 28.37 70.11 36.55 77.36 45.93 78.80 C 53.29 80.04 61.17 77.79 66.70 72.75 C 71.98 68.08 75.05 61.07 74.98 54.02 C 75.18 51.13 74.58 48.13 75.39 45.32 C 76.52 42.89 80.64 43.35 81.09 46.04 C 81.64 53.67 81.44 61.79 77.64 68.67 C 72.90 77.88 63.37 84.16 53.12 85.33 C 53.05 88.90 53.39 92.48 52.89 96.03 C 51.96 98.57 47.96 98.54 47.09 95.97 C 46.63 92.44 46.94 88.87 46.88 85.33 C 36.40 84.13 26.65 77.58 22.02 68.04 C 18.52 61.30 18.37 53.46 18.93 46.06 Z" />


          <line v-if="! active" x1="0" y1="0" x2="100" y2="100" stroke="red" stroke-width="6" />
        </g>
      </svg>
      <span v-if="label" class="mr-[0.5rem] mt-[0.15rem]">{{ label }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: "UserMicrophone",
  props:{
    height: 0,
    width: 0,
    active: false,
    show: false,
    fill: "#dbdbdb",
    user: Object,
    responsive: false,
    label: null,
    menu: false,
    title: String
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
    this.status = this.$props.active;
    this.socket = this.$store.state.socket;
  },
  watch:{
    "$store.state.user.media.media.local.microphone"(value){
      this.status = value;
      this.disabled = false;
    }
  },
  methods:{
    async control(){
      this.disabled = true
      if (! this.status && this.user && this.user.media && this.user.media.media.remote.microphone) {
        this.$store.dispatch('shareStream',{
          media: 'microphone',
        });
      } else if (this.user.media.media.remote.microphone && this.user.media.media.local.microphone) {
        this.$store.dispatch('shareStream',{
          media: 'microphone',
        });
        this.status = false;
      }
    },
    selectOption(option) {
      this.$store.dispatch('setDefaultDevice',{
        type: 'microphone',
        value: option
      });
      this.showDropdown = false;
    },
  }
}
</script>

<style scoped>

</style>