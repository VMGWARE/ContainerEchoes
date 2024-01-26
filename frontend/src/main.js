/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";

// DOMPurify
import VueDOMPurifyHTML from "vue-dompurify-html";

// Vue Toastification
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Vue Toastification Options
const ToastOptions = {
  position: "bottom-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.7,
};

// Mixins
import titleMixin from "./mixins/titleMixin";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Create app
const app = createApp(App);

// Mixins
app.mixin(titleMixin);

// Plugins
registerPlugins(app);

// Vue Toastification
app.use(Toast, ToastOptions);

// DOMPurify
app.use(VueDOMPurifyHTML);

// Mount
app.mount("#app");
