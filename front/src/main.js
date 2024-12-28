import { createApp } from 'vue'
import App from './App.vue'
import './style.scss'
import {
  Quasar,
  AppFullscreen,
  Dialog,
  Loading,
  Meta,
  Notify,
  Cookies
} from 'quasar'
import router from './router';

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/material-icons-round/material-icons-round.css'
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'
import '@quasar/extras/material-symbols-sharp/material-symbols-sharp.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});

createApp(App)
  .use(router)
  .use(Quasar, {
    plugins: {
      AppFullscreen,
      Dialog,
      Loading,
      Meta,
      Notify,
      Cookies
    },
  })
  .mount('#app');