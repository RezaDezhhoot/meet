<template>
  <form action="" class="form">
    <div class="form-group pb-3 text-right m-0">
      <i class="fa fa-star text-danger fa-2xs"></i>
      <small class="text-danger fa-xs">
        قبلا ثبت نام کردید ؟
      </small>
      <router-link :to="{name:'login_action', query: { room: $route.query.room }}">
        <small class="pr-1 text-muted fa-xs" role="button"><u>هم اکنون وارد شوید</u></small>
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
        <button v-on:click.prevent="getToken" class="btn btn-sm py-1 px-3 btn-primary rounded-pill"><small>مرحله بعد</small></button>
      </div>
    </div>
    <div v-else-if="step === 'verify-number'">
      <div class="form-group text-right">
        <input
            type="text"
            v-model="user.code"
            v-bind:class="{'is-invalid':errors.code}"
            v-on:blur="validate('phone')"
            class="form-control text-muted"
            placeholder="کد ارسال شده را وارد کنید"
        >
        <small class="text-danger fa-xs" v-if="!!errors.code">
          {{ errors.code }}
        </small>
        <small class="text-danger fa-xs" v-else-if="!!errors.phone">
          {{ errors.phone }}
        </small>
        <small v-if="status" class="text-success fa-xs">
          کد با موفقیت ارسال شد
        </small>
      </div>
      <a class="text-muted" v-on:click="getToken">
        <small>کد تایید دریافت نکردید؟ </small>
        <small class="text-primary py-3 fa-xs" role="button">ارسال مجدد</small>
      </a>
      <div class="form-group d-flex align-items-center justify-content-between">
        <button v-on:click.prevent="verifyToken" class="btn btn-sm py-1 px-3 btn-primary rounded-pill"><small>مرحله بعد</small></button>
      </div>
    </div>
    <div v-else-if="step === 'register-number'">
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
            <input
              type="email"
              v-model="user.email"
              v-bind:class="{'is-invalid':errors.email}"
              v-on:blur="validate('email')"
              class="form-control text-muted"
              placeholder="ایمیل خود را وارد کنید"
            >
            <small class="text-danger fa-xs" v-if="!!errors.email">
              {{ errors.email }}
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
          </div>
          <div class="form-group text-right">
            <input
              type="password"
              v-model="user.floatingConfirmation"
              v-bind:class="{'is-invalid':errors.floatingConfirmation}"
              v-on:blur="validate('floatingConfirmation')"
              class="form-control text-muted"
              placeholder="تایید گذواژه"
            >
            <small class="text-danger fa-xs" v-if="!!errors.floatingConfirmation">
              {{ errors.floatingConfirmation }}
            </small>
          </div>
      <div class="form-group d-flex align-items-center justify-content-between">
        <button v-on:click.prevent="register" class="btn btn-sm py-1 px-3 btn-primary rounded-pill"><small>ثبت نام</small></button>
      </div>
    </div>
  </form>
</template>

<script>
// import {mapGetters} from "vuex";
import {registerSchema , getTokenSchema , verifyTokenSchema } from "../../secure/AurhVlidator";
import axios from "axios";

export default {
  name: "login",
  mounted() {
    this.step = this.$route.params.step;
    if (! this.phone) {
      this.$router.push({
        name: 'register',
        query:{
          room: this.$route.query.room
        }
      });
    }
  },
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
        name: null,
        phone: null,
        email: null,
        password: null,
        floatingConfirmation: null,
        code: null,
      },
      errors: {
        name: null,
        email: null,
        phone: null,
        password: null,
        floatingConfirmation: null,
        code: null
      }
    }
  },
  methods:{
    verifyToken(){
      verifyTokenSchema.validate(this.user,{abortEarly: false})
          .then(() => {
            this.resetErrors();
            axios.post(`/v1/auth/register/verify-token?room=${this.$route.query.room}&lang=fa`,{
              phone: this.user.phone,
              code: this.user.code
            }).then(res => {
              this.status = true;
              this.$router.push({
                name: 'register',
                params:{
                  step:  'register-number',
                },
                query:{
                  room: this.$route.query.room
                }
              });
            }).catch(err => {
              if (err.response.data.data) {
                err.response.data.data.forEach(error => {
                  return this.errors[error.filed] = error.message;
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
    getToken(){
      getTokenSchema.validate(this.user,{abortEarly: false})
          .then(() => {
            this.resetErrors();
            axios.post(`/v1/auth/register/get-token?room=${this.$route.query.room}&lang=fa`,{
              phone: this.user.phone
            }).then(res => {
              this.status = true;
              this.$router.push({
                name: 'register',
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
                  name: 'register',
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
    register(){
      registerSchema.validate(this.user,{abortEarly: false})
        .then(() => {
          this.resetErrors();
          axios.post(`/v1/auth/register?room=${this.$route.query.room}&lang=fa`,this.user).then(res => {
            this.$cookies.set('auth',res.data.data);
            this.$emit('redirect-to-meet',this.$route.query.room);
          }).catch(err => {
            console.log(err)
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
    validate(input) {
      registerSchema.validateAt(input,this.user).then(() => {
        this.resetErrors(input);
      }).catch(err => {
        this.errors[input] = err.message;
      });
    },
    resetErrors(input = null)
    {
      if (input === null) {
        this.errors = {
          full_name: '',
          email: "",
          password: '',
          passwordConfirmation: '',
          recaptcha: "",
        };
      } else this.errors[input] = "";
    }
  },
}
</script>

<style scoped>

</style>
