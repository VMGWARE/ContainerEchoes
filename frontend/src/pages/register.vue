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

            <!-- Form -->
            <v-card-text>
              <v-form v-model="valid">
                <!-- Name -->
                <v-text-field
                  label="Name"
                  prepend-icon="mdi-account"
                  v-model="name"
                  :rules="nameRules"
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

            <!-- Register button -->
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
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      showPassword: false,
      nameRules: [
        (v) => !!v || "Name is required",
        // (v) => (v && v.length >= 3) || "Name must be at least 3 characters",
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
    async register() {
      // Set processing to true
      this.processing = true;

      if (this.valid) {
        try {
          const response = await axios.post("/auth/register", {
            name: this.name,
            email: this.email,
            password: this.password,
            password_confirmation: this.confirmPassword,
          });
          var resp = response.data;

          if (resp.code != 201) {
            // Set processing to true
            this.processing = false;

            // Show the error
            toast.error(resp.response.data.message);
          } else {
            this.$router.push("/login");
          }
        } catch (error) {
          // Set processing to true
          this.processing = false;

          // Show the error
          toast.error(error.response.data.message);
        }
      } else {
        // Set processing to true
        this.processing = false;
      }
    },
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
