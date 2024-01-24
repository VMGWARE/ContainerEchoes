<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="headline"> Login </v-card-title>
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
            <v-spacer></v-spacer>
            <v-btn color="primary" :disabled="!valid" @click="login">
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
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
    };
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
/* Add any additional styling specific to the login page here */
</style>
