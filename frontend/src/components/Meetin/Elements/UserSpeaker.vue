<template>
  <div v-if="! responsive" class="flex mx-2 relative align-center">
    <button  @click="showDropdown=!showDropdown" class="dropdown-btn border-x-2 border-y-2 border-[#d1d1d1] text-white">&#9662;</button>
    <div v-show="showDropdown" class="dropdown-content">
      <a v-for="(speaker , key) in $store.state.speakers " @click="selectOption(speaker.id)">
        <small>
          {{ speaker.id === $store.state.selectedSpeakerDevice ? '✔️' : '' }} {{speaker.label}}
        </small>
        <hr>
      </a>
    </div>
    <button :title="title" v-on:click="control" class="specer px-1 border-l-2 border-y-2  rounded-l-lg border-[#d1d1d1]" :class="{'icon-red': !active , 'flex my-[1rem]': responsive }" >
      <svg :width="width" :height="height" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="#000000ff">
          <path fill="#62dc82" opacity="1.00" d=" M 54.45 13.41 C 56.55 11.81 59.82 12.44 61.37 14.52 C 62.66 16.05 62.44 18.16 62.53 20.02 C 62.45 40.66 62.57 61.31 62.47 81.96 C 62.91 86.01 57.77 89.12 54.49 86.61 C 47.75 81.00 41.90 74.29 34.97 68.94 C 28.71 68.33 22.39 69.12 16.13 68.56 C 11.62 67.94 8.15 63.58 8.36 59.06 C 8.34 52.69 8.23 46.32 8.41 39.96 C 8.57 35.50 12.47 31.54 16.94 31.34 C 22.63 31.05 28.34 31.49 34.03 31.18 C 35.41 31.26 36.34 30.08 37.32 29.31 C 43.06 24.05 48.57 18.51 54.45 13.41 Z" />
          <path fill="#62dc82" opacity="1.00" d=" M 80.43 24.40 C 81.80 23.74 83.59 24.25 84.36 25.59 C 94.15 40.11 94.09 60.63 83.93 74.94 C 82.54 76.66 79.53 75.97 78.80 73.96 C 78.10 72.21 79.48 70.68 80.20 69.21 C 87.26 57.44 87.08 41.83 79.86 30.17 C 78.47 28.46 77.99 25.45 80.43 24.40 Z" />
          <path fill="#62dc82" opacity="1.00" d=" M 71.29 34.32 C 72.65 33.38 74.74 33.92 75.51 35.38 C 80.39 44.48 80.38 56.16 75.18 65.11 C 73.25 67.75 68.55 65.07 70.00 62.09 C 73.08 55.49 74.04 47.66 71.11 40.83 C 70.26 38.78 68.70 35.80 71.29 34.32 Z" />
        </g>
      </svg>

      <span v-if="label" class="mr-[0.5rem] mt-[0.15rem]">{{ label }}</span>
    </button>
  </div>
  <div v-else class="flex align-center mx-4 my-6 relative  border-r-2 rounded-r-lg border-y-2">
    <button :title="title" v-on:click="control" class="specer px-2  responsive-action  border-[#d1d1d1]" :class="{'icon-red': !active , 'flex my-[1rem]': responsive }" >
      <svg :width="width" :height="height" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="#000000ff">
          <path fill="#62dc82" opacity="1.00" d=" M 54.45 13.41 C 56.55 11.81 59.82 12.44 61.37 14.52 C 62.66 16.05 62.44 18.16 62.53 20.02 C 62.45 40.66 62.57 61.31 62.47 81.96 C 62.91 86.01 57.77 89.12 54.49 86.61 C 47.75 81.00 41.90 74.29 34.97 68.94 C 28.71 68.33 22.39 69.12 16.13 68.56 C 11.62 67.94 8.15 63.58 8.36 59.06 C 8.34 52.69 8.23 46.32 8.41 39.96 C 8.57 35.50 12.47 31.54 16.94 31.34 C 22.63 31.05 28.34 31.49 34.03 31.18 C 35.41 31.26 36.34 30.08 37.32 29.31 C 43.06 24.05 48.57 18.51 54.45 13.41 Z" />
          <path fill="#62dc82" opacity="1.00" d=" M 80.43 24.40 C 81.80 23.74 83.59 24.25 84.36 25.59 C 94.15 40.11 94.09 60.63 83.93 74.94 C 82.54 76.66 79.53 75.97 78.80 73.96 C 78.10 72.21 79.48 70.68 80.20 69.21 C 87.26 57.44 87.08 41.83 79.86 30.17 C 78.47 28.46 77.99 25.45 80.43 24.40 Z" />
          <path fill="#62dc82" opacity="1.00" d=" M 71.29 34.32 C 72.65 33.38 74.74 33.92 75.51 35.38 C 80.39 44.48 80.38 56.16 75.18 65.11 C 73.25 67.75 68.55 65.07 70.00 62.09 C 73.08 55.49 74.04 47.66 71.11 40.83 C 70.26 38.78 68.70 35.80 71.29 34.32 Z" />
        </g>
      </svg>

      <span v-if="label" class="mr-[0.5rem] mt-[0.15rem]">{{ label }}</span>
    </button>

    <button  @click="showDropdown=!showDropdown" style="color:#0c0e1a"  class="dropdown-btn text-black border-x-2 border-y-2 border-[#d1d1d1] text-white">&#9662;</button>
    <div v-show="showDropdown" class="dropdown-content">
      <a v-for="(speaker , key) in $store.state.speakers " @click="selectOption(speaker.id)">
        <small>
          {{ speaker.id === $store.state.selectedSpeakerDevice ? '✔️' : '' }} {{speaker.label}}
        </small>
        <hr>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserSpeaker",
  data(){
    return {
      showDropdown: false,
    };
  },
  computed: {
    active() {
      return this.$store.state.sound
    }
  },
  props:{
    height: 0,
    width: 0,
    label: null,
    responsive: false,
    title: String
  },
  mounted() {
    localStorage.setItem('sound',"false");
  },
  methods:{
    control(){
      localStorage.setItem('sound',(! this.active));
      this.$store.commit('controlSound', {
        value: ! this.active,
      });
    },
    selectOption(option) {
      this.$store.dispatch('setDefaultDevice',{
        type: 'speaker',
        value: option
      });
      this.showDropdown = false;
    },
  }
}
</script>

<style scoped>

</style>