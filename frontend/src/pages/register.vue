<template>
  <!-- eslint-disable vue/no-v-html -->

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4 pt-7"
      max-width="448"
    >
      <VCardItem class="justify-center">
        <VCardTitle class="font-weight-semibold text-2xl text-uppercase">
          <img
            src="@images/logo.png"
            alt="Echoes Logo"
            height="150px"
            width="150px"
            style="background-color: white; border-radius: 5px; margin-bottom: 10px"
          >
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VForm
          v-model="valid"
          @submit.prevent="() => {}"
        >
          <VRow>
            <!-- name -->
            <VCol cols="12">
              <VTextField
                v-model="name"
                :rules="nameRules"
                required
                label="Name"
                placeholder="John Doe"
              />
            </VCol>

            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model="email"
                :rules="emailRules"
                required
                label="Email"
                placeholder="johndoe@email.com"
                type="email"
              />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="password"
                label="Password"
                placeholder="············"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                :rules="passwordRules"
                required
                @click:append-inner="showPassword = !showPassword"
              />

              <!--
                <div class="d-flex align-center mt-1 mb-4">
                <VCheckbox
                id="privacy-policy"
                v-model="form.privacyPolicies"
                inline
                />
                <VLabel
                for="privacy-policy"
                style="opacity: 1"
                >
                <span class="me-1">I agree to</span>
                <a
                href="javascript:void(0)"
                class="text-primary"
                >privacy policy & terms</a
                >
                </VLabel>
                </div> 
              -->
            </VCol>

            <!-- confirm password -->
            <VCol cols="12">
              <VTextField
                v-model="confirmPassword"
                label="Confirm Password"
                placeholder="············"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                :rules="passwordRules"
                required
                @click:append-inner="showPassword = !showPassword"
              />

              <VBtn
                block
                color="primary"
                :disabled="!valid || processing"
                class="mt-4"
                @click="register"
              >
                <VProgressCircular
                  v-if="processing"
                  indeterminate
                  color="primary"
                  class="mr-2"
                  size="20"
                />
                Sign up
              </VBtn>
            </VCol>

            <!-- login instead -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>Already have an account?</span>
              <RouterLink
                class="text-primary ms-2"
                to="login"
              >
                Sign in instead
              </RouterLink>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<script>
import { useTheme } from 'vuetify'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import authV1Tree2 from '@images/pages/auth-v1-tree-2.png'
import authV1Tree from '@images/pages/auth-v1-tree.png'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

export default {
  title: 'Register',
  setup() {
    const vuetifyTheme = useTheme()

    return {
      vuetifyTheme,
      authV1Tree,
      authV1Tree2,
    }
  },
  data() {
    return {
      valid: false,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      nameRules: [
        v => !!v || 'Name is required',

        // (v) => (v && v.length >= 3) || "Name must be at least 3 characters",
      ],
      emailRules: [
        v => !!v || 'Email is required',

        // (v) => (v && v.length >= 3) || "Email must be at least 3 characters",
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => (v && v.length >= 6) || 'Password must be at least 6 characters',
      ],
      processing: false,
    }
  },
  computed: {
    authThemeMask() {
      return this.vuetifyTheme.global.name.value === 'light' ? authV1MaskLight : authV1MaskDark
    },
  },
  methods: {
    async register() {
      // Set processing to true
      this.processing = true

      if (this.valid) {
        try {
          const response = await axios.post('/auth/register', {
            name: this.name,
            email: this.email,
            password: this.password,
            password_confirmation: this.confirmPassword,
          })

          var resp = response.data

          if (resp.code != 201) {
            // Set processing to true
            this.processing = false

            // Show the error
            toast.error(resp.response.data.message)
          } else {
            this.$router.push('/login')
          }
        } catch (error) {
          // Set processing to true
          this.processing = false

          // Show the error
          toast.error(error.response.data.message)
        }
      } else {
        // Set processing to true
        this.processing = false
      }
    },
  },
}
</script>

<style lang="scss">
@use '@core/scss/pages/page-auth.scss';
</style>
