<template>
  <div  v-if="user.hasOwnProperty('id') && user.id === room.host.id">
    <div @click="end" class="flex cursor-pointer mr-[1rem] px-[0.7rem] py-[0.2rem] border rounded-full justify-center items-center text-[#ffffff] hidden-mobile" :class="{'hidden': !recording}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z" stroke="#FF2E2E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15.71 15.18L12.61 13.33C12.07 13.01 11.63 12.24 11.63 11.61V7.51001" stroke="#FF2E2E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <span ref="timer" class="mr-[0.8rem] mt-[0.2rem]"></span>
    </div>

    <div v-on:click="start" class="flex cursor-pointer mr-[1rem] px-[0.7rem] py-[0.2rem] border rounded-full justify-center items-center text-[#ffffff] hidden-mobile" :class="{'hidden': recording}">
      <button class="flex text-[1rem] justify-center items-center text-[#ffffff]"  >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#FF2E2E" class="bi bi-record2-fill" viewBox="0 0 16 16">
          <path d="M10 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
          <path d="M8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
        </svg>
      </button>
    </div>
  </div>

</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: "Recorder",
  data(){
    return {
      recording: false,
      mediaRecorder: null,
      recordedChunks: [],
      timer: null,
      stream: null
    }
  },
  computed: {
    host() {
      return this.$store.state.host;
    },
    user() {
      return this.$store.state.user;
    },
    room(){
      return this.$store.state.room;
    },
    microphone(){
      return this.$store.state.localStream;
    },
  },
  methods:{
    end() {
      if (this.stream) {
        for (const track of this.stream.getTracks()) {
          if (this.microphone && track.kind === "audio") {
            continue
          }
          track.stop();
          this.stopAndSave()
        }
      }
    },
    async start() {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: false,
      });

      const audioStream = this.microphone ? this.microphone : await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true
        }
      });
      this.$store.commit('setRecorderLocalStream' , audioStream)

      this.stream = new MediaStream([
        ...stream.getTracks(),
        ...audioStream.getTracks()
      ]);
      const videoTrack = this.stream.getVideoTracks()[0];
      videoTrack.onended = async () => {
        this.end()
      };
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'video/webm' });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };
      this.mediaRecorder.onstop = async () => {
        await this.stopAndSave()
      };
      this.mediaRecorder.start();
      this.recording = true;
      this.startTime();
    },
    async stopAndSave() {
      if (this.recordedChunks.length > 0) {
        const now = new Date()
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const fileName = `${this.room.title}_${now.getFullYear()}_${now.getMonth()}_${now.getDay()}_${Date.now()}.webm`
        const file = new File([blob], fileName, { type: blob.type, lastModified: new Date().getTime() });
        const formData = new FormData();
        formData.append("file", file);
        this.stream = null
        this.$store.commit('setRecorderLocalStream' , null)
        this.recordedChunks = []
        try {
          const {data} = await axios.post("/v1/files", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": "Bearer " + this.$cookies.get("auth").token,
              "dir": "records",
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                this.progress = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                );
              }
            },
          });
        } catch (error) {
          console.log(error)
          Swal.fire({
            position: 'top-start',
            text: "خطا در هنگام ارسال فایل ضبط شده!",
            icon: 'warning',
            showConfirmButton: false,
            backdrop: false,
            timer: 3500,
          })
        }
      }

      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.mediaRecorder = null;
      }
      this.recording = false;
      clearInterval(this.timer)
    },
    startTime() {
      let totalSeconds = 0;
      const timerElement = this.$refs.timer;
      function pad(num) {
        return num.toString().padStart(2, '0');
      }
      this.timer = setInterval(() => {
        totalSeconds++;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        timerElement.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      }, 1000);
    },
  }
}
</script>

<style scoped>

</style>