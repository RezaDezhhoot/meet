import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import { store } from "./stores/store";
import VueCookies from 'vue-cookies';
import PrimeVue from 'primevue/config';

const baseURL = import.meta.env.VITE_BASE_URL
axios.defaults.baseURL = `${baseURL}/api`;
axios.defaults.withCredentials = false;
import App from './App.vue'
import router from './router'

console.log(baseURL)
const app = createApp(App)
let AppName = 'Brand name';
let logo = null;

router.beforeEach((to, from, next) => {
    switch (to.name) {
        case 'meeting':
            import ('../src/assets/meet/styles/style.css');
            import ('../src/assets/meet/styles/custom.css');
            break;
        case 'error':
            import ('../src/assets/error/css/style.css');
            break;
        case 'oauth':
            import ('../src/assets/meet/styles/custom.css');
            break;
        default:
            import ('../src/assets/auth/css/bootstrap.min.css');
            import ('../src/assets/auth/css/style.css');
    }
    next();
})

router.afterEach((to, from) => {
    if (to.name === 'meeting') {
        import('../src/assets/meet/scripts/script.js');
        import('../src/assets/meet/scripts/tailwindcss.js');
    }
})

app.provide('BaseUrl',baseURL);
app.use(PrimeVue);
app.use(createPinia())
app.use(router)
app.use(store)
app.use(VueCookies,{
    path: '/',
    secure: false,
})

app.$cookies.config('7d');

app.mount('#app')