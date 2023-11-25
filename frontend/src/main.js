import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios';
import { store } from "./stores/store";
import VueCookies from 'vue-cookies';
import { useFavicon } from '@vueuse/core';

const baseURL = 'http://backend.localhost:3000';
axios.defaults.baseURL = `${baseURL}/api`; // Replace with your API base URL

import App from './App.vue'
import router from './router'

const app = createApp(App)
let AppName = 'Brand name';


router.beforeEach((to, from, next) => {
    switch (to.name) {
        case 'meeting':
            import ('../src/assets/meet/styles/style.css');
            import ('../src/assets/meet/styles/custom.css');
            break;
        case 'error':
            import ('../src/assets/error/css/style.css');
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
    }
})

// const base = await axios.get('/v1/settings/base?lang=fa');
//
// if (base && base.data.data.title) {
//     AppName = base.data.data.title;
// }
//
// if (base && base.data.data.logo) {
//     const icon = useFavicon();
//     icon.value = base.data.data.logo;
// }

app.provide('AppName',AppName);
app.provide('BaseUrl',baseURL);

app.use(createPinia())
app.use(router)
app.use(store)
app.use(VueCookies,{
    path: '/',
    secure: false,
})

app.$cookies.config('7d');

app.mount('#app')
