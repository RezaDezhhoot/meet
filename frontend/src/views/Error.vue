<template>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:500" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Titillium+Web:700,900" rel="stylesheet">
  <div id="notfound">
    <div class="notfound">
      <div class="notfound-404">
        <h1>{{ code }}</h1>
      </div>
      <h2>خطایی رخ داده</h2>
      <template v-if="code == 403">
        <p>متاسفیم ، شما به این اتاق دسترسی ندارید !</p>
      </template>
      <template v-else-if="code == 422">
        <p>متاسفیم ، ظرفیت اتاق تکمیل می باشد پس از مدتی دوباره تلاش نمایید !</p>
      </template>
      <template v-else>
        <p>متاسفیم ، اتاق مورد نظر یافت نشد !</p>
      </template>


      <RouterLink tag="a" :to="{name:'login_action', query: { room: $route.query.room }}" >
        <small class="text-muted d-block mb-1 px-2">بازشگت</small>
      </RouterLink>
    </div>
  </div>
</template>

<script>
export default {
  name: "Error",
  watch:{
    "$route.params.code"(value) {
      this.code = value;
    }
  },
  mounted() {
    let code;
    this.$cookies.remove('auth');
    if (code = this.$route.params.code) {
      this.code = code;
    }
  },
  data(){
    return {
      code: 403
    }
  }
}
</script>

<style scoped>

</style>