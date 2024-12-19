<template>
  <section :style="'width:'+ width +'%'" class="right-section h-full ml-[0.5rem] flex flex-col  items-center">
    <Camera v-if="content" height="32"></Camera>
    <Users v-if="showUserBox"></Users>
    <Chat v-if="showChatBox"></Chat>
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
  },
  props:{
    width: 30
  },
  computed: {
    showUserBox() {
      return this.$store.state.top.users;
    },
    showChatBox() {
      return this.$store.state.top.chat;
    },
    content(){
      return this.$store.state.main_content
    },
  }
}
</script>

<style scoped>

</style>