import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import { store } from "./stores/store";
import VueCookies from 'vue-cookies';
import { useFavicon } from '@vueuse/core';
import PrimeVue from 'primevue/config';
const baseURL = import.meta.env.VITE_BASE_URL
axios.defaults.baseURL = `${baseURL}/api`; // Replace with your API base URL

import App from './App.vue'
import router from './router'

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

axios.get('/v1/settings/base?lang=fa').then(base => {
    if (base && base.data.data.title) {
        AppName = base.data.data.title;
        app.provide('AppName',AppName);
    }

    if (base && base.data.data.logo) {
        app.provide('LogoAddr',base.data.data.logo);
        const icon = useFavicon();
        icon.value = base.data.data.logo;
    }

}).then(() => {
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
}).catch(err => {});


