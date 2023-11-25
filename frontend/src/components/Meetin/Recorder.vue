<template>
  <div  v-if="user && host && user.user?.id === host.user.id">
    <div class="flex mr-[1rem] px-[0.7rem] py-[0.2rem] border rounded-full justify-center items-center text-[#ffffff] hidden-mobile" v-if="recording">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z" stroke="#FF2E2E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15.71 15.18L12.61 13.33C12.07 13.01 11.63 12.24 11.63 11.61V7.51001" stroke="#FF2E2E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <span class="mr-[0.8rem] mt-[0.2rem]">00:05:13</span>
    </div>

    <div class="flex mr-[1rem] px-[0.7rem] py-[0.2rem] border rounded-full justify-center items-center text-[#ffffff] hidden-mobile" v-else>
      <button class="flex text-[1rem] justify-center items-center text-[#ffffff]" v-on:click="start" >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FF2E2E" class="bi bi-record2-fill" viewBox="0 0 16 16">
          <path d="M10 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
          <path d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
        </svg>
      </button>
    </div>
  </div>

</template>

<script>
export default {
  name: "Recorder",
  props:{
    user: Object,
    host: Object,
    room: Object,
  },
  data(){
    return {
      recording: false,
      mediaRecorder: null,
      recordedChunks: []
    }
  },
  methods:{
    async start() {

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
      });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        console.log(1);
      };

      this.mediaRecorder.start();
      this.recording = true;
    },
    async stop() {
      this.mediaRecorder.stop();
      this.recording = false;
    }
  }
}
</script>

<style scoped>

</style>