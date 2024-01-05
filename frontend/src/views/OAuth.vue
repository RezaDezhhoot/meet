<template>
  <div v-if="mainLoading" class="loader">
    <loader></loader>
  </div>
</template>

<script>
import Loader from "../components/Meetin/Elements/Loader.vue";
import axios from 'axios'
import Swal from "sweetalert2";

export default {
  components:{
    loader: Loader
  },
  data(){
    return {
      mainLoading: true
    }
  },
  beforeMount() {
    axios.post('/v1/auth/oauth/verify',{
      token: this.$route.params.token
    }).then(res => {
      console.log(res);
      this.$cookies.set('auth',res.data.data.user);
      this.$emit('redirect-to-meet',res.data.data.room);
    }).catch(err => {
      this.mainLoading = false;
      Swal.fire({
        position: 'center',
        text: 'مشکلی در عملیات ورود پیش آمده، لطفا مجدد امتحان نمایید',
        icon: 'warning',
        showConfirmButton: true,
        confirmButtonText: 'باشه',
        backdrop: false,
        timer: 8000,
      }).then((result) => {
        window.close();
      })
    })
  },
  name: "OAuth"
}
</script>

<style scoped>

</style>