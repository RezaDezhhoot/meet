<template>
  <button v-on:click="control" :title="title" class="manage-user-screen">
    <svg width="20" height="20" viewBox="0 0 24 24" :fill="client.media.media.remote.screen ? '#377E47' : 'none'" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 16.95H6.21C2.84 16.95 2 16.11 2 12.74V6.74003C2 3.37003 2.84 2.53003 6.21 2.53003H16.74C20.11 2.53003 20.95 3.37003 20.95 6.74003" stroke="#AAAAAA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 21.4699V16.95" stroke="#AAAAAA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 12.95H10" stroke="#AAAAAA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.73999 21.47H9.99999" stroke="#AAAAAA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 12.8V18.51C22 20.88 21.41 21.47 19.04 21.47H15.49C13.12 21.47 12.53 20.88 12.53 18.51V12.8C12.53 10.43 13.12 9.83997 15.49 9.83997H19.04C21.41 9.83997 22 10.43 22 12.8Z" stroke="#AAAAAA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17.2445 18.25H17.2535" stroke="#AAAAAA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>

<script>
import Swal from "sweetalert2";
export default {
  name: "Screen",
  props:{
    client: Object,
    title: String
  },
  created() {
    this.wires();
  },
  methods:{
    control(){
      if (this.$store.state.displayStream) {
        Swal.fire({
          icon: "warning",
          title: "امکان صدور دسترسی هنگام اشتراک گزاری صفحه ممکن نیست",
        });
        return
      }
      this.$store.state.socket.emit('control-remote-media',{
        to: this.client.socketId,
        device: 'screen'
      });
    },
    wires(){

    }
  }
}
</script>

<style scoped>

</style>