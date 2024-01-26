<template>
  <v-container style="height: 100vh" class="login-page" fluid>
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card>
            <v-card-title class="headline">
              <v-img
                src="@/assets/logo.png"
                alt="Vuetify Logo"
                height="150px"
                style="
                  background-color: white;
                  border-radius: 5px;
                  margin-bottom: 10px;
                "
              ></v-img>
            </v-card-title>
            <v-card-text>
              <v-form v-model="valid">
                <v-text-field
                  label="Username"
                  prepend-icon="mdi-account"
                  v-model="username"
                  :rules="usernameRules"
                  required
                ></v-text-field>
                <v-text-field
                  label="Password"
                  prepend-icon="mdi-lock"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPassword = !showPassword"
                  :rules="passwordRules"
                  required
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <router-link to="/forgot-password">
                <v-btn color="primary" href="/register"> Register </v-btn>
              </router-link>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                :disabled="!valid || processing"
                @click="login"
              >
                Login
              </v-btn>
            </v-card-actions>

            <!-- Loading icon when processing -->
            <v-card-actions v-if="processing" class="justify-center">
              <v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
  title: "Login",
  data() {
    return {
      valid: false,
      username: "",
      password: "",
      showPassword: false,
      usernameRules: [
        (v) => !!v || "Username is required",
        (v) => (v && v.length >= 3) || "Username must be at least 3 characters",
      ],
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => (v && v.length >= 6) || "Password must be at least 6 characters",
      ],
      processing: false,
    };
  },
  computed: {
    redirectMessage() {
      let urlParams = new URLSearchParams(window.location.search);
      let redirect = urlParams.get("redirect");
      // Remove harmful characters from the redirect URL
      redirect = redirect ? redirect.replace(/<|>/g, "") : null;
      // Encode the URL to safely display it to the user
      const sanitizedRedirect = redirect ? encodeURIComponent(redirect) : null;
      let readableRedirect = sanitizedRedirect;
      // Replace the encoded / with a slash
      readableRedirect = readableRedirect
        ? readableRedirect.replace(/%2F/g, "/")
        : null;
      return sanitizedRedirect
        ? `You will be redirected to <a href="${sanitizedRedirect}">${readableRedirect}</a> upon successful login.`
        : "";
    },
  },
  methods: {
    login() {
      if (this.valid) {
        // Perform login logic here
        console.log("Logging in:", this.username);
      }
    },
  },
};
</script>

<style scoped>
.login-page,
.register-page {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
}
</style>
