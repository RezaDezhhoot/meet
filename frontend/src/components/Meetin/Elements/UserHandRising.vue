<template>
  <div v-if="responsive && menu" class="flex my-6 mx-4 align-center relative">
    <button
        v-on:click="control"
        class="flex px-2 py-1 rounded-r-lg border-x-2 border-y-2 responsive-action  border-[#d1d1d1]"
        v-if="show"
        :disabled="disabled"
    >
      <svg v-if="border" class="mt-[0.1rem] ml-[0.3rem]" width="15" height="15" viewBox="0 0 24 24" :fill="fill" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.9201 8.94995L13.4001 15.47C12.6301 16.24 11.3701 16.24 10.6001 15.47L4.08008 8.94995" stroke="#dbdbdb" stroke-width="2.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <svg :width="width" :height="height" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="#000000ff">
          <path :fill="fill" opacity="1.00" d=" M 47.96 11.95 C 47.82 9.41 49.55 6.85 52.10 6.35 C 55.38 5.57 58.68 8.58 58.30 11.92 C 58.45 23.91 58.19 35.92 58.40 47.92 C 58.25 50.65 62.63 50.60 62.44 47.86 C 62.64 37.25 62.37 26.63 62.54 16.02 C 62.35 13.03 64.95 10.12 68.03 10.39 C 70.85 10.51 73.10 13.15 72.88 15.94 C 73.06 27.29 72.74 38.66 73.01 50.01 C 72.80 51.43 74.49 52.47 75.74 51.95 C 77.40 51.34 76.94 49.41 77.10 48.05 C 77.15 40.01 76.95 31.97 77.15 23.94 C 77.12 20.95 80.01 18.25 83.02 18.82 C 86.03 19.12 87.81 22.20 87.50 25.03 C 87.48 39.33 87.54 53.65 87.48 67.96 C 87.72 81.27 75.26 92.69 62.05 91.68 C 56.71 91.61 51.37 91.78 46.03 91.60 C 40.68 91.40 35.87 88.55 31.90 85.15 C 23.46 77.88 15.87 69.73 8.13 61.74 C 6.31 60.08 5.48 57.17 7.07 55.06 C 9.61 51.71 14.45 51.65 18.17 52.63 C 23.57 54.56 28.32 57.89 33.33 60.62 C 33.37 45.71 33.28 30.81 33.36 15.91 C 33.19 13.24 35.27 10.63 37.99 10.47 C 41.09 9.99 43.84 12.90 43.70 15.91 C 43.92 26.60 43.54 37.31 43.85 48.00 C 43.56 50.63 48.09 50.56 47.83 47.97 C 48.09 35.97 47.78 23.95 47.96 11.95 Z" />
        </g>
      </svg>

      <span v-if="label" class="mr-[0.5rem] text-black mt-[0.15rem]">{{ label }}</span>
    </button>
  </div>
  <div class="flex mx-2 relative align-center" v-else>
    <button
        v-on:click="control"
        :class="{'border': border , 'mr-[1rem]': border , 'px-[0.5rem]' : border ,'py-[0.2rem]': border , 'mx-[1rem]': responsive,'my-[1rem]': responsive}"
        class="flex rounded-full  justify-center items-center text-[#dbdbdb]"
        v-if="show"
        :disabled="disabled"
    >
      <svg v-if="border" class="mt-[0.1rem] ml-[0.3rem]" width="15" height="15" viewBox="0 0 24 24" :fill="fill" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.9201 8.94995L13.4001 15.47C12.6301 16.24 11.3701 16.24 10.6001 15.47L4.08008 8.94995" stroke="#dbdbdb" stroke-width="2.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <svg :width="width" :height="height" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g id="#000000ff">
          <path :fill="fill" opacity="1.00" d=" M 47.96 11.95 C 47.82 9.41 49.55 6.85 52.10 6.35 C 55.38 5.57 58.68 8.58 58.30 11.92 C 58.45 23.91 58.19 35.92 58.40 47.92 C 58.25 50.65 62.63 50.60 62.44 47.86 C 62.64 37.25 62.37 26.63 62.54 16.02 C 62.35 13.03 64.95 10.12 68.03 10.39 C 70.85 10.51 73.10 13.15 72.88 15.94 C 73.06 27.29 72.74 38.66 73.01 50.01 C 72.80 51.43 74.49 52.47 75.74 51.95 C 77.40 51.34 76.94 49.41 77.10 48.05 C 77.15 40.01 76.95 31.97 77.15 23.94 C 77.12 20.95 80.01 18.25 83.02 18.82 C 86.03 19.12 87.81 22.20 87.50 25.03 C 87.48 39.33 87.54 53.65 87.48 67.96 C 87.72 81.27 75.26 92.69 62.05 91.68 C 56.71 91.61 51.37 91.78 46.03 91.60 C 40.68 91.40 35.87 88.55 31.90 85.15 C 23.46 77.88 15.87 69.73 8.13 61.74 C 6.31 60.08 5.48 57.17 7.07 55.06 C 9.61 51.71 14.45 51.65 18.17 52.63 C 23.57 54.56 28.32 57.89 33.33 60.62 C 33.37 45.71 33.28 30.81 33.36 15.91 C 33.19 13.24 35.27 10.63 37.99 10.47 C 41.09 9.99 43.84 12.90 43.70 15.91 C 43.92 26.60 43.54 37.31 43.85 48.00 C 43.56 50.63 48.09 50.56 47.83 47.97 C 48.09 35.97 47.78 23.95 47.96 11.95 Z" />
        </g>
      </svg>

      <span v-if="label" class="mr-[0.5rem] text-black mt-[0.15rem]">{{ label }}</span>
    </button>
  </div>
</template>

<script>

import Swal from 'sweetalert2'


export default {
  name: "UserHandRising",
  props:{
    height: 0,
    width: 0,
    active: false,
    show: false,
    fill: "#dbdbdb",
    user: Object,
    responsive: false,
    label: null,
    border: false,
    menu: false,
    disabled: false,
  },
  mounted() {
    this.wires();
  },
  methods:{
    control(){
      this.$store.state.socket.emit('hand-rising',{
        to: this.user.socketId
      })
    },
    wires(){
      this.$store.state.socket.on('client-risen-hand' , async data => {
        if (data.data.status) {
          Swal.fire({
            position: 'top-start',
            text: `${ data.data.sender } دست خود را بلند کرده است `,
            showConfirmButton: false,
            backdrop: false,
            timer: 3500,
          })
        }
      });
    }
  }
}
</script>

<style scoped>

</style>