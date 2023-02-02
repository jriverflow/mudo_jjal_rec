/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'
import Home from './views/Home.vue'
import Release from './views/Release.vue'
import People from './views/People.vue'
import Mechanism from './views/About.vue'

// Composables
import { createApp } from 'vue'

import { createRouter, createWebHistory } from 'vue-router'
import mixins from './mixins'

// Plugins
import { registerPlugins } from '@/plugins'
import vuetify from './plugins/vuetify'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/', name: 'Home', component: Home},
    {path: '/release', name: 'Release', component: Release},
    {path: '/people', name: 'People', component: People},
    {path: '/about', name: 'About', component: Mechanism},
  ]
})

const app = createApp(App)

registerPlugins(app)

app
  .use(router)
  .use(vuetify)
  .mixin(mixins)
  .mount('#app')
