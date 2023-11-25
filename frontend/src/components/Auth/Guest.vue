<template>
  <form action="" class="form">
    <div class="form-group text-right">
      <input
          type="text"
          v-model="user.name"
          v-bind:class="{'is-invalid':errors.name}"
          v-on:blur="validate('name')"
          class="form-control text-muted"
          placeholder="نام خود را وارد کنید"
      >
      <small class="text-danger fa-xs" v-if="!!errors.name">
        {{ errors.name }}
      </small>
    </div>
    <div class="form-group text-right">
<!--      <Checkbox  v-model="user.recaptcha" />-->
    </div>
    <div class="form-group">
      <button v-on:click.prevent="login" class="btn btn-sm py-1 px-3 btn-primary rounded-pill"><small>ورود به اتاق</small></button>
    </div>
  </form>
</template>

<script>
import {GuestSchema} from "../../secure/AurhVlidator";
import {mapGetters} from 'vuex';
import axios from "axios";

export default {
  name: "Guest",
  data(){
    return {
      user: {
        name: null,
        recaptcha: null
      },
      errors:{
        name:null,
        recaptcha: null
      }
    }
  },
  methods:{
    login(){
      GuestSchema.validate(this.user,{abortEarly: false})
          .then(() => {
            this.resetErrors();
            axios.post(`/v1/auth/guest?room=${this.$route.query.room}&lang=fa`,{
              name: this.user.name
            }).then((res) => {
              this.$cookies.set('auth',res.data.data);
              this.$emit('redirect-to-meet',this.$route.query.room);
            }).catch(err =>{
              err.response.data.data.forEach(error => {
                return this.errors[error.filed] = error.message;
              });
            })
          }).catch(err => {
        this.resetErrors();
        err.inner.forEach(error => {
          return this.errors[error.path] = error.message;
        });
      })
    },
    validate(input) {
      GuestSchema.validateAt(input,this.user).then(() => {
        this.resetErrors(input);
      }).catch(err => {
        this.errors[input] = err.message;
      })
    },
    resetErrors(input = null) {
      if (input === null) {
        this.errors = {
          name: "",
          recaptcha: ""
        };
      } else this.errors[input] = "";
    },
  },
}
</script>

<style scoped>

</style>