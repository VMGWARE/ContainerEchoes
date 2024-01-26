<template>
  <v-container style="height: 100vh" class="register-page" fluid>
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card>
            <v-card-title class="headline">
              <v-img
                src="@/assets/logo.png"
                alt="Echoes Logo"
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
                <!-- Username -->
                <v-text-field
                  label="Username"
                  prepend-icon="mdi-account"
                  v-model="username"
                  :rules="usernameRules"
                  required
                ></v-text-field>

                <!-- Email -->
                <v-text-field
                  label="Email"
                  prepend-icon="mdi-email"
                  v-model="email"
                  :rules="emailRules"
                  required
                ></v-text-field>

                <!-- Password -->
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

                <!-- Confirm Password -->
                <v-text-field
                  label="Confirm Password"
                  prepend-icon="mdi-lock"
                  v-model="confirmPassword"
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
              <v-btn
                color="primary"
                :disabled="!valid || processing"
                @click="register"
              >
                Register
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
import axios from "axios";
import { useToast } from "vue-toastification";
const toast = useToast();

export default {
  title: "Register",
  data() {
    return {
      valid: false,
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      showPassword: false,
      usernameRules: [
        (v) => !!v || "Username is required",
        // (v) => (v && v.length >= 3) || "Username must be at least 3 characters",
      ],
      emailRules: [
        (v) => !!v || "Email is required",
        // (v) => (v && v.length >= 3) || "Email must be at least 3 characters",
      ],
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => (v && v.length >= 6) || "Password must be at least 6 characters",
      ],
      processing: false,
    };
  },
  methods: {
    async register() {},
  },
};
</script>

<style scoped>
.register-page,
.register-page {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
}
</style>
