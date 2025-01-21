
<template>
  <div class="auth">
    <div class="container-fluid h-100">
      <div class="row justify-content-end h-100">
        <div class="col-xl-4 col-md-6 mx-md-auto mx-lg-0 col-12 d-flex align-items-center justify-content-center">
          <div class="w-100">
            <h2 class="title mx-auto text-right text-danger mb-4 ">
              <strong>
                {{app_name}}
              </strong>
            </h2>
            <div class="bg-white text-right ml-lg-5 p-4 shadow-sm rounded">
              <div class="form-navbar mb-2 d-flex align-items-center justify-content-between">
                <div><small class="text-muted">ورود به صورت:</small></div>
                <ul class="list-inline d-flex p-0 m-0">
                  <RouterLink tag="li" active-class="active-tab" class="list-group-item text-decoration-none border-0 p-0" :to="{name:'guest', query: { room: $route.query.room }}"  role="button">
                    <small class="text-muted d-block mb-1 px-2">مهمان</small>
                  </RouterLink>
                  <RouterLink tag="li" active-class="active-tab" class="list-group-item text-decoration-none border-0 p-0" :to="{name:'login_action', query: { room: $route.query.room }}"   role="button">
                    <small class="text-muted d-block mb-1 px-2">کاربر</small>
                  </RouterLink>
                </ul>
              </div>
              <small v-if="! room_exists" class="text-right text-danger">
                آدرس جلسه مورد نشر یافت نشد!
              </small>
              <KeepAlive v-else>
                <RouterView @redirect-to-meet="redirectToMeet"></RouterView>
              </KeepAlive>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import "../../lib/jquery.min.js";
import {useFavicon} from "@vueuse/core/index";

export default {
  name: "Auth",
  data(){
    return {
      room_exists: false,
      app_name: null
    };
  },
  methods:{
    redirectToMeet(room) {
      this.$emit('redirect-to-meet',room)
    },
  },
  mounted() {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/settings/base?lang=fa`).then(res => {
      if (base && base.data.data.title) {
        this.app_name = base.data.data.title;
      }
      if (base && base.data.data.logo) {
        const icon = useFavicon();
        icon.value = base.data.data.logo;
      }
      document.title = this.app_name;
    }).catch(err => {
      document.title = 'خطا در برقراری ارتباط'

    });

    fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/rooms/exists?room=${this.$route.query.room}`).then(res => {
      this.room_exists = true;
      this.$emit("check-for-login",this.$route.query.room,this.room_exists);
    }).catch(err => {
      this.room_exists = false;
    });

  },
}
</script>
<style >
html, body , #app {
  height: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0;
}
</style>