<template>
  <section class="right-section w-[30%] h-full ml-[0.5rem] flex flex-col justify-between items-center">
    <Camera></Camera>
    <Users></Users>
    <Chat></Chat>
  </section>

  <section class="navbar hide-pc">
    <div class="btn-chat-tab active">
      <span>گفت و گو</span>
    </div>

    <div class="btn-users-tab">
      <span>کاربران</span>
    </div>

    <div class="btn-video-tab">
      <span>ویدئو</span>
    </div>
  </section>
</template>

<script>
import Audio from "./Elements/UserMicrophone.vue";
import Chat from "./Chat.vue";
import Camera from "./Camera.vue";
import Users from "./Users.vue";

export default {
  name: "Sidebar",
  components:{
    Audio , Chat , Camera , Users
  }
}
</script>

<style scoped>

</style>