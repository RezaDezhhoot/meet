<template>
  <div class="users-tab w-full h-[32%] mr-[0.5rem] bg-white rounded-b-[0.5rem] lg:rounded-[0.5rem] px-[1.2rem] py-[1rem] hidden-mobile">
    <div class="flex w-full justify-between border-b-[1px] border-[#aaaaaa] h-[2rem] mb-[0.5rem]">
      <div class="text-[#616161] font-bold flex justify-center items-center pb-[0.5rem]">
        <div class="flex justify-center items-center box-mini-menu">
          <div class="close-mini-menu hidden"></div>
        </div>

        <span class="mx-[0.5rem]">کاربران ({{ Object.entries(clients).length }})</span>
      </div>

      <div class="flex text-[#616161] font-bold">
        <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g id="#000000ff">
            <path fill="#aaaaaa" opacity="1.00" d=" M 46.44 8.64 C 56.42 6.70 67.10 13.24 69.88 23.01 C 72.43 30.88 69.66 40.09 63.21 45.26 C 56.96 50.52 47.53 51.49 40.34 47.61 C 33.23 43.97 28.65 35.98 29.21 28.00 C 29.55 18.57 37.14 10.10 46.44 8.64 Z" />
            <path fill="#aaaaaa" opacity="1.00" d=" M 23.38 58.53 C 40.26 58.07 57.19 58.47 74.09 58.33 C 78.20 57.98 82.42 60.79 83.12 64.96 C 83.81 70.13 83.23 75.81 79.98 80.08 C 75.79 85.66 69.08 88.63 62.47 90.23 C 52.77 92.44 42.42 92.15 32.99 88.92 C 27.36 86.92 21.86 83.52 18.87 78.17 C 16.73 74.53 16.42 70.14 16.73 66.01 C 16.90 62.39 19.80 59.11 23.38 58.53 Z" />
          </g>
        </svg>
      </div>
    </div>

    <div class="box-sidbar-users">
      <ul>
        <li class="host-style" v-if="host">
          <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g id="#000000ff">
              <path fill="#df1111" opacity="1.00" d=" M 46.44 8.64 C 56.42 6.70 67.10 13.24 69.88 23.01 C 72.43 30.88 69.66 40.09 63.21 45.26 C 56.96 50.52 47.53 51.49 40.34 47.61 C 33.23 43.97 28.65 35.98 29.21 28.00 C 29.55 18.57 37.14 10.10 46.44 8.64 Z" />
              <path fill="#df1111" opacity="1.00" d=" M 23.38 58.53 C 40.26 58.07 57.19 58.47 74.09 58.33 C 78.20 57.98 82.42 60.79 83.12 64.96 C 83.81 70.13 83.23 75.81 79.98 80.08 C 75.79 85.66 69.08 88.63 62.47 90.23 C 52.77 92.44 42.42 92.15 32.99 88.92 C 27.36 86.92 21.86 83.52 18.87 78.17 C 16.73 74.53 16.42 70.14 16.73 66.01 C 16.90 62.39 19.80 59.11 23.38 58.53 Z" />
            </g>
          </svg>

          <span>{{ host.name }}</span>
        </li>
        <template v-for="(item,key) in clients">
          <li v-if="item.user?.id !== room.host.id">
            <svg width="25" height="25" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g id="#000000ff">
                <path :fill="item.socketId === socket.id ? '#377D22' : '#aaaaaa'" opacity="1.00" d=" M 46.44 8.64 C 56.42 6.70 67.10 13.24 69.88 23.01 C 72.43 30.88 69.66 40.09 63.21 45.26 C 56.96 50.52 47.53 51.49 40.34 47.61 C 33.23 43.97 28.65 35.98 29.21 28.00 C 29.55 18.57 37.14 10.10 46.44 8.64 Z" />
                <path :fill="item.socketId === socket.id ? '#377D22' : '#aaaaaa'" opacity="1.00" d=" M 23.38 58.53 C 40.26 58.07 57.19 58.47 74.09 58.33 C 78.20 57.98 82.42 60.79 83.12 64.96 C 83.81 70.13 83.23 75.81 79.98 80.08 C 75.79 85.66 69.08 88.63 62.47 90.23 C 52.77 92.44 42.42 92.15 32.99 88.92 C 27.36 86.92 21.86 83.52 18.87 78.17 C 16.73 74.53 16.42 70.14 16.73 66.01 C 16.90 62.39 19.80 59.11 23.38 58.53 Z" />
              </g>
            </svg>

            <span>{{ item.name }}</span>
            <Audio width="20" height="20" fill="#616161" :socket="socket" :user="item" :show="item.media.media.remote.microphone" :active="item.media.media.remote.microphone && item.media.media.local.microphone"></Audio>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import Audio from "./Elements/Audio.vue";

export default {
  name: "Users",
  components:{
    Audio
  },
  props:{
    clients: Array,
    room: Object,
    socket: Object,
    user: Object,
    host: null,
  }
}
</script>

<style scoped>

</style>