/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '@/store'
import VueDOMPurifyHTML from 'vue-dompurify-html'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
const ToastOptions = {
  position: 'bottom-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.7,
}
import titleMixin from '@/mixins/titleMixin'
// import router from '@/router'

export function registerPlugins(app) {
  app
    .use(vuetify)
    // .use(router)
    .use(pinia)
    .use(Toast, ToastOptions)
    .use(VueDOMPurifyHTML)
    .mixin(titleMixin)
}
