<template>
  <button v-on:click="kick" class="manage-user-kick ml-[0.3rem] flex text-[#aaaaaa] border border-[#aaaaaa] rounded-[2rem] py-[0.1rem] px-[0.3rem]">
    <small class="ml-[0.2rem]">اخراج</small>

    <svg width="20" height="20" viewBox="0 0 24 20" fill="red" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 5.97998C17.67 5.64998 14.32 5.47998 10.98 5.47998C9 5.47998 7.02 5.57998 5.04 5.77998L3 5.97998" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18.85 9.14001L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79002C6.00002 22 5.91002 20.78 5.80002 19.21L5.15002 9.14001" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.33 16.5H13.66" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.5 12.5H14.5" stroke="#aaaaaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: "Kick",
  props:{
    client: Object,
    socket: Object
  },
  methods:{
    kick(){
      Swal.fire({
        title: 'آیا از اخراج این کاربر اطمینان دارید؟',
        text: "کاربر اخراج شده به مدت 2 ساعت به جلسه دسترسی نخواهد داشت!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'بله',
        cancelButtonText: 'خیر'
      }).then((result) => {
        if (result.isConfirmed) {
          this.socket.emit('kick-client',{
            to: this.client.socketId
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>