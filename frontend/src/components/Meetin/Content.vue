<template>
  <section :class="{'full-screen': (full && content)}" class="left-section share-screen w-[70%] h-full mr-[0.5rem] bg-white rounded-[0.5rem] ">
    <div class="h-full px-[1.2rem] py-[1rem] w-full " v-if="! content">
      <div class="h-full w-full flex flex-col justify-center items-center">
        <div class="w-[30%] no-file-img">
          <img class="w-full" src="/meet/icons/4480052@0.png" alt="فایل">
        </div>

        <div v-if="! loading">
          <div class="flex flex-col justify-center items-center my-[0.5rem]">
            <span class="text-[2rem] font-bold text-[#b8b8b8] text-center">هیچ چیزی اشتراک گذاری نشده!</span>

          </div>

          <div class="flex no-file-btns " v-if="$store.state.user && $store.state.user.media.media.remote.screen">
            <!--          <button class="flex text-[#616161] border border-[#d1d1d1] rounded-[0.3rem] justify-center items-center h-full mx-[0.5rem]">-->
            <!--            <div class="flex justify-center items-center w-[2.5rem] border-l border-[#d1d1d1] h-full">-->
            <!--              <svg width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">-->
            <!--                <path d="M19.9201 8.94995L13.4001 15.47C12.6301 16.24 11.3701 16.24 10.6001 15.47L4.08008 8.94995" stroke="#909090" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>-->
            <!--              </svg>-->
            <!--            </div>-->

            <!--            <div class="flex px-[0.5rem] py-[0.4rem]">-->
            <!--              <span class="font-bold text-[#616161] px-[0.8rem]">وایت برد</span>-->

            <!--              <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">-->
            <!--                <g id="#000000ff">-->
            <!--                  <path fill="#5481ff" opacity="1.00" d=" M 73.74 8.79 C 76.02 5.35 81.08 4.21 84.57 6.42 C 87.44 8.16 90.39 9.88 92.78 12.26 C 94.97 14.72 94.83 18.18 94.06 21.17 C 96.44 24.68 95.76 29.01 95.82 33.00 C 95.78 48.69 95.85 64.39 95.79 80.09 C 96.01 83.44 93.70 86.74 90.39 87.50 C 87.64 88.01 84.81 87.77 82.03 87.81 C 59.03 87.79 36.04 87.80 13.05 87.81 C 10.43 87.90 7.54 87.34 5.84 85.15 C 4.05 83.21 4.17 80.44 4.14 77.99 C 4.25 60.63 4.06 43.27 4.23 25.92 C 4.20 21.96 8.00 18.76 11.88 19.03 C 30.27 18.95 48.67 19.03 67.07 19.00 C 69.34 15.63 71.35 12.08 73.74 8.79 M 77.81 13.84 C 72.84 21.56 67.94 29.32 62.91 36.98 C 60.03 40.89 60.16 46.00 59.35 50.57 C 63.94 48.96 69.35 47.36 71.76 42.74 C 76.71 35.33 81.73 27.97 86.75 20.61 C 87.39 19.47 88.48 18.40 88.38 16.99 C 86.50 14.59 83.63 13.11 81.00 11.64 C 79.40 11.00 78.60 12.87 77.81 13.84 M 10.46 25.42 C 10.49 44.12 10.20 62.83 10.60 81.51 C 36.88 81.51 63.16 81.61 89.44 81.46 C 89.72 63.53 89.49 45.58 89.56 27.64 C 84.78 34.59 80.06 41.57 75.34 48.56 C 73.28 51.96 69.23 53.02 65.96 54.87 C 63.65 56.20 61.04 56.90 58.36 56.72 C 55.02 60.88 49.42 63.88 44.07 61.86 C 36.39 59.30 35.00 49.47 27.81 46.32 C 22.85 44.36 18.76 48.25 14.71 50.37 C 14.84 42.53 24.75 37.51 31.65 40.43 C 38.37 43.06 40.85 50.55 46.14 54.88 C 48.84 57.08 52.46 56.08 55.45 55.15 C 51.99 51.41 53.51 46.29 54.36 41.87 C 55.06 35.40 60.08 30.75 63.05 25.26 C 45.52 25.37 27.98 25.06 10.46 25.42 Z" />-->
            <!--                </g>-->
            <!--              </svg>-->
            <!--            </div>-->
            <!--          </button>-->

            <label for="mediaInput" class="flex cursor-pointer text-[#616161] border border-[#d1d1d1] rounded-[0.3rem] justify-center items-center h-full mx-[0.5rem]">
              <div class="flex px-[0.5rem] py-[0.4rem]">
                <span  class="font-bold text-[#616161] px-[0.8rem]">فایل</span>

                <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <g id="#000000ff">
                    <path fill="#5481ff" opacity="1.00" d=" M 24.38 8.55 C 32.24 7.99 40.14 8.54 48.01 8.30 C 50.71 8.46 54.04 7.64 56.05 9.97 C 64.56 18.45 73.07 26.95 81.55 35.46 C 83.55 37.05 83.38 39.73 83.38 42.03 C 83.24 55.35 83.43 68.68 83.29 82.00 C 83.54 87.08 79.11 91.71 74.03 91.61 C 58.68 91.77 43.32 91.59 27.97 91.69 C 24.84 91.79 21.42 91.17 19.26 88.69 C 16.90 86.45 16.61 83.05 16.63 79.99 C 16.74 59.31 16.59 38.63 16.70 17.96 C 16.52 13.49 19.94 9.21 24.38 8.55 M 22.91 18.97 C 22.91 37.65 22.93 56.34 22.91 75.03 C 22.96 77.94 22.59 80.93 23.31 83.78 C 24.38 85.84 27.06 85.27 28.96 85.44 C 43.97 85.28 58.98 85.55 73.98 85.31 C 76.37 85.49 77.26 83.00 77.09 81.04 C 77.10 67.92 77.07 54.79 77.08 41.67 C 71.03 41.58 64.98 41.84 58.93 41.58 C 54.46 41.50 50.33 37.66 50.13 33.15 C 49.77 26.97 50.11 20.78 50.00 14.60 C 42.00 14.69 34.00 14.44 26.01 14.68 C 23.60 14.49 22.74 17.01 22.91 18.97 M 56.25 19.00 C 56.40 23.63 55.94 28.28 56.43 32.90 C 56.48 34.15 57.68 35.33 58.96 35.25 C 63.51 35.68 68.08 35.26 72.63 35.40 C 67.19 29.91 61.72 24.46 56.25 19.00 Z" />
                  </g>
                </svg>
              </div>
            </label>
            <input type="file" @change="handleFileUpload" hidden id="mediaInput" />
            <div class="upload-progress"  :style="{ width: progress + '%' }"></div>
            <button class="flex mx-auto text-[#616161] border border-[#d1d1d1] rounded-[0.3rem] justify-center items-center h-full mx-[0.5rem]">
              <div v-on:click="startShareScreen" class="flex px-[0.5rem] py-[0.4rem]">
                <span class="font-bold text-[#616161] px-[0.8rem]">صفحه نمایش</span>
                <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <g id="#000000ff">
                    <path fill="#5481ff" opacity="1.00" d=" M 8.37 19.94 C 8.16 14.79 12.80 10.25 17.92 10.44 C 39.30 10.37 60.68 10.38 82.05 10.43 C 87.18 10.23 91.81 14.76 91.62 19.91 C 91.72 34.27 91.67 48.63 91.65 62.99 C 91.94 67.85 88.02 72.58 83.08 72.81 C 76.92 73.14 70.75 72.83 64.58 72.94 C 64.58 76.40 64.58 79.87 64.58 83.34 C 67.48 83.37 70.43 83.03 73.29 83.66 C 76.24 84.87 75.11 89.80 71.89 89.52 C 58.28 89.75 44.66 89.49 31.04 89.64 C 29.23 89.46 26.91 90.00 25.61 88.38 C 24.38 86.90 24.96 84.42 26.73 83.65 C 29.58 83.05 32.52 83.36 35.42 83.34 C 35.42 79.87 35.42 76.40 35.42 72.94 C 29.27 72.83 23.11 73.14 16.97 72.82 C 12.05 72.62 8.08 67.95 8.35 63.09 C 8.33 48.71 8.29 34.32 8.37 19.94 M 16.14 17.10 C 14.33 18.02 14.69 20.33 14.55 22.01 C 14.65 35.65 14.48 49.30 14.63 62.94 C 14.19 65.52 16.67 67.02 18.95 66.66 C 39.32 66.69 59.68 66.63 80.05 66.69 C 81.39 66.57 82.91 66.80 84.11 66.07 C 85.77 64.94 85.25 62.68 85.45 60.97 C 85.32 47.30 85.55 33.62 85.35 19.96 C 85.58 17.49 83.09 16.42 81.01 16.67 C 61.01 16.64 41.01 16.72 21.00 16.63 C 19.38 16.68 17.69 16.55 16.14 17.10 M 41.67 72.94 C 41.67 76.40 41.67 79.87 41.67 83.33 C 47.22 83.33 52.78 83.33 58.33 83.33 C 58.33 79.87 58.33 76.40 58.33 72.93 C 52.78 72.93 47.22 72.93 41.67 72.94 Z" />
                  </g>
                </svg>
              </div>
            </button>
          </div>
        </div>
        <div v-else>
          <loader></loader>
        </div>
      </div>

    </div>

    <div :class="{ hidden: !content}" class="h-full content-view">
      <video :class="{'force-hidden ':! shareScreen}" class="h-full rounded my-[1rem] w-full" muted autoplay playsinline ref="screenPlayer" id="screen-player"></video>
      <div  :class="{'force-hidden ': ! shareFile}" class="h-full" ><div id="iframeContainer" class="h-full flex p-2 mx-auto text-center justify-center"></div></div>
      <div class="controller ">
        <div  class="video-controller">
          <ul>
            <li v-on:click="full = ! full">
              <svg v-if="! full" width="25px" height="25px" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
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
                <path d="M264.943,156.665h108.273c6.833,0,11.934-5.39,11.934-12.211c0-6.833-5.101-11.85-11.934-11.838h-96.242V36.181
                  c0-6.833-5.197-12.03-12.03-12.03s-12.03,5.197-12.03,12.03v108.273c0,0.036,0.012,0.06,0.012,0.084
                  c0,0.036-0.012,0.06-0.012,0.096C252.913,151.347,258.23,156.677,264.943,156.665z"/>
                <path d="M120.291,24.247c-6.821,0-11.838,5.113-11.838,11.934v96.242H12.03c-6.833,0-12.03,5.197-12.03,12.03
                  c0,6.833,5.197,12.03,12.03,12.03h108.273c0.036,0,0.06-0.012,0.084-0.012c0.036,0,0.06,0.012,0.096,0.012
                  c6.713,0,12.03-5.317,12.03-12.03V36.181C132.514,29.36,127.124,24.259,120.291,24.247z"/>
                <path d="M120.387,228.666H12.115c-6.833,0.012-11.934,5.39-11.934,12.223c0,6.833,5.101,11.85,11.934,11.838h96.242v96.423
                  c0,6.833,5.197,12.03,12.03,12.03c6.833,0,12.03-5.197,12.03-12.03V240.877c0-0.036-0.012-0.06-0.012-0.084
                  c0-0.036,0.012-0.06,0.012-0.096C132.418,233.983,127.1,228.666,120.387,228.666z"/>
                <path d="M373.3,228.666H265.028c-0.036,0-0.06,0.012-0.084,0.012c-0.036,0-0.06-0.012-0.096-0.012
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
            <li v-if="$store.state.displayStream || file" v-on:click="end">
              <svg fill="red" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                   viewBox="0 0 512.456 512.456" xml:space="preserve">
              <g transform="translate(-1)">
              <g>
                <g>
                  <path d="M506.845,376.187c-2.507-4.739-5.667-9.463-9.428-14.215c-8.571-10.83-20.228-21.791-34.287-32.906
                    c-9.809-7.755-20.237-15.145-30.657-21.961c-6.267-4.1-11.191-7.129-14.123-8.847c-24.748-14.091-53.259-12.224-67.985,11.503
                    c-0.684,0.813-1.554,1.841-2.569,3.033c-2.775,3.261-5.591,6.519-8.261,9.539c-0.571,0.645-0.571,0.645-1.142,1.287
                    c-4.448,4.994-8.5,9.183-8.381,9.102c-16.25,10.998-26.86,10.129-41.23-4.241c-9.845-9.845-26.329-7.774-33.432,4.2
                    l-42.411,71.488c-4.974,8.385-3.631,19.076,3.263,25.97c90.916,90.916,181.583,111.883,257.669,35.797l22.933-22.933
                    C514.455,425.352,518.524,398.246,506.845,376.187z M466.634,412.833l-22.933,22.933c-52.76,52.76-114.173,41.95-185.458-24.338
                    l21.685-36.552c23.487,12.662,48.852,10.201,74.057-6.858c4.166-2.84,8.778-7.607,16.272-16.022
                    c0.625-0.703,0.625-0.703,1.246-1.405c2.866-3.242,5.849-6.694,8.785-10.144c1.761-2.069,3.122-3.686,3.91-4.63l2.223-3.224
                    c0.637-1.135,3.593-1.371,10.589,2.611c2.129,1.25,6.466,3.918,12.106,7.607c9.425,6.165,18.842,12.839,27.554,19.727
                    c11.686,9.238,21.099,18.09,27.291,25.913c2.233,2.822,3.966,5.412,5.173,7.693C472.054,401.659,471.037,408.429,466.634,412.833
                    z"/>
                  <path d="M109.286,300.518l71.488-42.411c11.974-7.104,14.045-23.588,4.2-33.432c-14.368-14.368-15.238-24.996-4.206-41.281
                    c-0.088,0.13,4.083-3.911,9.038-8.321c0.654-0.582,0.654-0.582,1.313-1.164c3.018-2.665,6.273-5.475,9.531-8.244
                    c1.194-1.014,2.223-1.883,3.035-2.566c23.736-14.725,25.608-43.254,11.645-67.781c-1.853-3.165-4.883-8.087-8.983-14.353
                    c-6.817-10.418-14.208-20.843-21.963-30.65c-11.113-14.054-22.074-25.706-32.902-34.275c-4.752-3.76-9.476-6.92-14.221-9.43
                    C115.209-5.067,88.103-0.997,70.453,16.653L47.519,39.587C-28.566,115.672-7.599,206.34,83.317,297.255
                    C90.211,304.149,100.901,305.492,109.286,300.518z M77.689,69.757l22.933-22.933c4.403-4.403,11.174-5.419,16.683-2.503
                    c2.289,1.21,4.879,2.943,7.701,5.176c7.823,6.19,16.674,15.6,25.911,27.281c6.888,8.71,13.562,18.125,19.728,27.548
                    c3.689,5.638,6.358,9.974,7.741,12.334c3.848,6.762,3.61,9.74,2.476,10.376l-3.208,2.21c-0.945,0.787-2.563,2.146-4.632,3.905
                    c-3.45,2.932-6.904,5.913-10.148,8.778c-0.718,0.635-0.718,0.635-1.436,1.273c-8.44,7.513-13.207,12.131-16.016,16.294
                    c-17.049,25.168-19.506,50.539-6.841,74.033l-36.553,21.685C35.739,183.929,24.929,122.517,77.689,69.757z"/>
                  <path d="M443.206,70.245c-8.331-8.331-21.839-8.331-30.17,0l-384,384c-8.331,8.331-8.331,21.839,0,30.17
                    c8.331,8.331,21.839,8.331,30.17,0l384-384C451.537,92.083,451.537,78.576,443.206,70.245z"/>
                </g>
              </g>
            </g>
            </svg>
            </li>
            <li @click="downloadSharedFile" v-if="content && shareFile">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 16V4M12 16l-4-4M12 16l4-4M5 20h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import loader from "@/components/Meetin/Elements/Loader.vue";
import axios from 'axios'
import Swal from "sweetalert2";

export default {
  name: "Content",
  components: {loader},
  computed:{
    loading() {
      return this.$store.state.mediaLoading
    },
    content(){
      return this.$store.state.content
    },
    shareScreen(){
      return  this.$store.state.shareScreen
    },
    shareFile(){
      return this.$store.state.shareFile
    },
    progress(){
      return this.$store.state.progress;
    }
  },
  data(){
    return {
      showing: false,
      full: false,
      file: null,
      filePreview: null,
      uploading: false,
    }
  },
  watch:{
    "$store.state.displayStream"(value) {
      if (value && value.active) {
        document.getElementById('screen-player').srcObject = value;
      } else {
        this.$store.state.shareScreen = false;
      }
    },
  },
  methods:{
    downloadSharedFile(){
      const url = this.shareFile.url
      fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.blob();
          })
          .then((blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = url.split('/').pop();
            link.click(); // Trigger the download
            URL.revokeObjectURL(link.href);
          })
          .catch((error) => {
            console.error('Download failed:', error);
          });
    },
   async handleFileUpload(event) {
      const uploadedFile = event.target.files[0];
      const validMime = ['application/pdf','image/jpeg','image/png','image/gif','image/jpg','application/vnd.openxmlformats-officedocument.presentationml.presentation']
      if (uploadedFile) {
        if (uploadedFile.size > 1024 * 1024 * 100) {
          Swal.fire({
            position: 'top-start',
            text: "حداکثر حجم فایل برای بارگزاری 100 مگابایت می باشد!",
            icon: 'warning',
            showConfirmButton: false,
            backdrop: false,
            timer: 3500,
          })
          return
        }
        if (! validMime.includes(uploadedFile.type))  {
          Swal.fire({
            position: 'top-start',
            text: "فرمت فایل نامعتبر می باشد!",
            icon: 'warning',
            showConfirmButton: false,
            backdrop: false,
            timer: 3500,
          })
          return
        }

        this.filePreview = URL.createObjectURL(uploadedFile);
        this.uploading = true;
        this.progress = 0;
        const formData = new FormData();
        formData.append("file", uploadedFile);
        try {
          const {data} = await axios.post("/v1/files", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": "Bearer " + this.$cookies.get("auth").token
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                this.$store.commit('updateProgress' , Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                ));
              }
            },
          });
          this.file = uploadedFile;
          this.filePreview = data.data.addr
          this.$store.dispatch('shareFile' , {mime: this.file.type , url: data.data.addr})
        } catch (error) {
          this.file = null;
          this.filePreview = null
          this.$store.commit('setContent' , false)
          this.$store.commit('setShareFile' , false)
          Swal.fire({
            position: 'top-start',
            text: "خظا در هنگام بارگزاری فایل!",
            icon: 'warning',
            showConfirmButton: false,
            backdrop: false,
            timer: 3500,
          })
        }
        this.progress = 0
        this.uploading = false;
        this.$store.commit('updateProgress' , 0);
      }
    },
    startShareScreen() {
      this.$store.dispatch('shareStream',{
        screen: true  , media: 'screen'
      });
    },
    end() {
      this.$store.dispatch('endScreen',{
        media: 'screen'
      });
      this.$store.commit('setContent' , false)
      this.$store.commit('setShareFile' , false)
    }
  }
}
</script>

<style scoped>

</style>