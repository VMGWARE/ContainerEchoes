/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";

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

// Mount
app.mount("#app");
