import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: import('../views/Auth.vue'),
      children: [
        {
          path : '/guest',
          component: import('../components/Auth/Guest.vue'),
          name: 'guest',
        },
        {
          path : '',
          name: 'login',
          children:[
            {
              path: '',
              component: import('../components/Auth/Login.vue'),
              name: 'login_action'
            },
            {
              path: 'register/:step?',
              component: import('../components/Auth/Register.vue'),
              name: 'register'
            },
            {
              path: 'forget/:step?',
              component: import('../components/Auth/Forget.vue'),
              name: 'forget'
            },
          ]
        },
      ]
    },
    {
      path: '/meeting/:key',
      name: 'meeting',
      component: import('../views/Meeting.vue')
    }
  ],
  scrollBehavior(to, from, savePosition) {
    if (to.hash) {
      if (savePosition)
        return savePosition;
      return { selector: to.hash }
    }
  },
})

export default router
