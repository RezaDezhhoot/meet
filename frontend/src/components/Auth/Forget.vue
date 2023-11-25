<template>
  <form action="" class="form">
    <div class="form-group pb-3 text-right m-0">
      <router-link :to="{name:'login_action', query: { room: $route.query.room }}">
        <small class="pr-1 text-muted fa-xs" role="button"><u>بازگشت به فرم ورود</u></small>
      </router-link>
    </div>
    <div v-if="! step">
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
      <div class="form-group d-flex align-items-center justify-content-between">
        <i></i>
        <button v-on:click.prevent="getToken" class="btn btn-sm py-1 px-3 btn-primary rounded-pill"><small>بررسی و ادامه</small></button>
      </div>
    </div>
    <div v-if="step === 'verify-number' ">
      <div class="form-group text-right">
        <input
            type="text"
            v-model="user.code"
            v-bind:class="{'is-invalid':errors.code}"
            v-on:blur="validateReset('code')"
            class="form-control text-muted"
            placeholder="کد ارسال شده را وارد کنید"
        >
        <small class="text-danger fa-xs" v-if="!!errors.code">
          {{ errors.code }}
        </small>
        <small class="text-danger fa-xs" v-else-if="!!errors.phone">
          {{ errors.phone }}
        </small>
        <small v-if="status" class="text-success  fa-xs">
          کد با موفقیت ارسال شد
        </small>
      </div>
      <div class="form-group text-right">
        <input
            type="password"
            v-model="user.password"
            v-bind:class="{'is-invalid':errors.password}"
            v-on:blur="validateReset('password')"
            class="form-control text-muted"
            placeholder="گذرواژه"
        >
        <small class="text-danger fa-xs" v-if="!!errors.password">
          {{ errors.password }}
        </small>
      </div>
      <div class="form-group text-right">
        <input
            type="password"
            v-model="user.floatingConfirmation"
            v-bind:class="{'is-invalid':errors.floatingConfirmation}"
            v-on:blur="validateReset('floatingConfirmation')"
            class="form-control text-muted"
            placeholder="تایید گذواژه"
        >
        <small class="text-danger fa-xs" v-if="!!errors.floatingConfirmation">
          {{ errors.floatingConfirmation }}
        </small>
      </div>
      <a class="text-muted" v-on:click="getToken">
        <small>کد تایید دریافت نکردید؟ </small>
        <small class="text-primary py-3 fa-xs" role="button">ارسال مجدد</small>
      </a>
      <div class="form-group d-flex align-items-center justify-content-between">
        <button v-on:click.prevent="reset" class="btn btn-sm py-1 px-3 btn-primary rounded-pill"><small>تغییر رمز</small></button>
      </div>
    </div>
  </form>
</template>

<script>

import {forgetSchema, resetPasswordSchema} from "../../secure/aurhVlidator";
import axios from "axios";

export default {
  name: "login",
  watch:{
    "$route.params.step"(value) {
      this.step = value;
    }
  },
  data(){
    return {
      step: null,
      status: false,
      user:{
        phone: null,
        password: null,
        floatingConfirmation: null,
        code: null,
      },
      errors: {
        phone: null,
        password: null,
        floatingConfirmation: null,
        code: null
      }
    }
  },
  methods:{
    getToken(){
      forgetSchema.validate(this.user,{abortEarly: false})
          .then(() => {
            this.resetErrors();
            axios.post(`/v1/auth/forget-password?room=${this.$route.query.room}&lang=fa`,{
              phone: this.user.phone
            }).then(res => {
              this.status = true;
              this.$router.push({
                name: 'forget',
                params:{
                  step:  'verify-number',
                },
                query:{
                  room: this.$route.query.room
                }
              });
            }).catch(err => {
              err.response.data.data.forEach(error => {
                return this.errors[error.filed] = error.message;
              });
              if (err.response.status === 403) {
                this.$router.push({
                  name: 'forget',
                  params:{
                    step:  'verify-number',
                  },
                  query:{
                    room: this.$route.query.room
                  }
                });
              }
            });
          }).catch(err => {
        this.resetErrors()
        err.inner.forEach(error => {
          return this.errors[error.path] = error.message;
        });
      })
    },
    reset(){
      resetPasswordSchema.validate(this.user,{abortEarly: false})
        .then(() => {
          this.resetErrors();
          axios.patch(`/v1/auth/reset-password?room=${this.$route.query.room}&lang=fa`,this.user).then(res => {
            this.$router.push({
              name:'login_action',
              query:{
                room: this.$route.query.room
              }
            });
          }).catch(err => {
            err.response.data.data.forEach(error => {
              return this.errors[error.filed] = error.message;
            });
          })
        }).catch(err => {
        this.resetErrors()
        err.inner.forEach(error => {
          return this.errors[error.path] = error.message;
        });
      })
    },
    validate(input ) {
      forgetSchema.validateAt(input,this.user).then(() => {
        this.resetErrors(input);
      }).catch(err => {
        this.errors[input] = err.message;
      });
    },
    validateReset(input , schema) {
      resetPasswordSchema.validateAt(input,this.user).then(() => {
        this.resetErrors(input);
      }).catch(err => {
        this.errors[input] = err.message;
      });
    },
    resetErrors(input = null) {
      if (input === null) {
        this.errors = {
          email: "",
          recaptcha: "",
        };
      } else this.errors[input] = "";
    }
  },
  mounted() {
    if (! this.phone) {
      this.$router.push({
        name: 'forget',
        query:{
          room: this.$route.query.room
        }
      });
    }
  },
}
</script>
