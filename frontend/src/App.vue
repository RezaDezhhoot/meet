<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>


<template>
  <RouterView @check-if-user-was-logged-in="checkIfUserWasLoggedIn" @redirect-to-meet="redirectToMeet" @check-for-login="checkForLogin" />
</template>

<script>
import { RouterView } from 'vue-router'

export default {
  name: "App",
  data(){
    return {
      room_exists: false,
    };
  },
  methods:{
    checkForLogin(room , exists = false){
      let auth = this.$cookies.get('auth');
      if (auth && exists) {
        this.redirectToMeet(room);
      }
    },
    checkIfUserWasLoggedIn(room){
      let auth = this.$cookies.get('auth');
      if (! auth) {
        this.$router.push({name: 'login', query:{room: room}}).then(() => {
          location.reload();
        });
      }
    },
    redirectToMeet(room) {
      this.$router.push({name: 'meeting', params:{key: room}}).then(() => {
        location.reload();
      });
    }
  }
}
</script>