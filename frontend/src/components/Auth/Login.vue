<template>
  <form action="" class="form">
    <div class="form-group pb-3 text-right m-0">
      <i class="fa fa-star text-danger fa-2xs"></i>
      <small class="text-danger fa-xs">
        برای ورود ابتدا باید ثبت نام کرده باشید!
      </small>
      <i class="fa fa-2xs text-danger fa-angle-double-left"></i>
      <router-link :to="{name:'register', query: { room: $route.query.room }}">
        <small class="pr-1 text-muted fa-xs" role="button"><u>ثبت نام</u></small>
      </router-link>
    </div>
    <div class="form-group text-right">
      <input
        type="text"
        v-model="user.phone"
        v-bind:class="{'is-invalid':errors.phone}"
        v-on:blur="validate('phone')"
        class="form-control text-muted"
        placeholder="شماره همراه خود را وارد کنید"
      >
      <small class="text-danger fa-xs" v-if="!!errors.phone">
        {{ errors.phone }}
      </small>
    </div>
    <div class="form-group text-right">
      <input
        type="password"
        v-model="user.password"
        v-bind:class="{'is-invalid':errors.password}"
        v-on:blur="validate('password')"
        class="form-control text-muted"
        placeholder="گذرواژه"
      >
      <small class="text-danger fa-xs" v-if="!!errors.password">
        {{ errors.password }}
      </small>
      <br v-if="!!errors.password">
      <router-link :to="{name:'forget', query: { room: $route.query.room }}">
        <small class="text-primary  py-3 fa-xs" role="button">گذرواژه خود را فراموش کرده اید؟</small>
      </router-link>
    </div>
    <div class="form-group d-flex align-items-center justify-content-between">

      <button
          v-on:click.prevent="login"
          class="btn btn-sm py-1 px-3 btn-primary rounded-pill"
      ><small>ورود به اتاق</small>
      </button>
    </div>
  </form>
</template>

<script>
import {loginSchema} from "../../secure/AurhVlidator.js";
import axios from "axios";

export default {
  name: "login",
  data(){
    return {
      user:{
        phone: '',
        password: '',
      },
      errors: {
        phone: "",
        password: '',
      }
    }
  },
  methods:{
    login(){
      loginSchema.validate(this.user,{abortEarly: false})
        .then(() => {
          this.resetErrors();
          axios.post(`/v1/auth/login?room=${this.$route.query.room}&lang=fa`,this.user).then((res) => {
            this.$cookies.set('auth',res.data.data);
            this.$emit('redirect-to-meet',this.$route.query.room);
          }).catch(err => {
            err.response.data.data.forEach(error => {
              return this.errors[error.filed] = error.message;
            });
          });
        }).catch(err => {
        this.resetErrors()
        if (err.inner) {
          err.inner.forEach(error => {
            return this.errors[error.path] = error.message;
          });
        }
      })
    },
    validate(input) {
      loginSchema.validateAt(input,this.user).then(() => {
        this.resetErrors(input);
      }).catch(err => {
        this.errors[input] = err.message;
      });
    },
    resetErrors(input = null)
    {
      if (input === null) {
        this.errors = {
          phone: "",
          password: '',
        };
      } else this.errors[input] = "";
    }
  }
}
</script>
<style scoped>

</style>
