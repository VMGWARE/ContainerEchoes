<script>
import { useTheme } from 'vuetify'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import authV1Tree2 from '@images/pages/auth-v1-tree-2.png'
import authV1Tree from '@images/pages/auth-v1-tree.png'
import { useUserStore } from '@/store/user'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

export default {
  title: 'Login',
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
      email: '',
      password: '',
      showPassword: false,
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
    redirectMessage() {
      let urlParams = new URLSearchParams(window.location.search)
      let redirect = urlParams.get('redirect')

      // Remove harmful characters from the redirect URL
      redirect = redirect ? redirect.replace(/<|>/g, '') : null


      // Encode the URL to safely display it to the user
      const sanitizedRedirect = redirect ? encodeURIComponent(redirect) : null
      let readableRedirect = sanitizedRedirect

      // Replace the encoded / with a slash
      readableRedirect = readableRedirect ? readableRedirect.replace(/%2F/g, '/') : null
      
      return sanitizedRedirect
        ? `You will be redirected to <a href="${sanitizedRedirect}">${readableRedirect}</a> upon successful login.`
        : ''
    },
    authThemeMask() {
      return this.vuetifyTheme.global.name.value === 'light' ? authV1MaskLight : authV1MaskDark
    },
  },
  methods: {
    async login() {
      // Set processing to true
      this.processing = true

      if (this.valid) {
        try {
          const response = await axios.post('/auth/login', {
            email: this.email,
            password: this.password,
          })

          var resp = response.data

          if (resp.code != 200) {
            // Set processing to true
            this.processing = false

            // Show the error
            toast.error(resp.response.data.message)
          } else {
            const token = resp.data.token
            const user = resp.data.user

            // Set the values
            useUserStore().token = token
            useUserStore().user = user
            useUserStore().loggedIn = true

            // Store the token and user in localStorage
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            // Set the axios defaults for headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

            // Set the token cookie for aslong as the token is valid, default is 1 day
            const date = new Date()

            date.setDate(date.getDate() + 1)
            document.cookie = `token=${token}; expires=${date.toUTCString()};sameSite=strict;path=/`

            let urlParams = new URLSearchParams(window.location.search)
            let redirect = urlParams.get('redirect')
            if (redirect) {
              this.$router.push(redirect)
            } else {
              this.$router.push('/')
            }
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

      <VCardText class="pt-2">
        <h5 class="text-h5 font-weight-semibold mb-1">
          Welcome to Container Echoes! 👋🏻
        </h5>
        <p class="mb-0">
          Please sign-in to your account and start the adventure
        </p>
      </VCardText>

      <VCardText>
        <VForm
          v-model="valid"
          @submit.prevent="() => {}"
        >
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model="email"
                label="Email"
                :rules="emailRules"
                required
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

              <!-- remember me checkbox -->
              <!--
                <div class="d-flex align-center justify-space-between flex-wrap mt-1 mb-4">
                <VCheckbox
                v-model="form.remember"
                label="Remember me"
                />

                <a
                class="ms-2 mb-1"
                href="javascript:void(0)"
                >
                Forgot Password?
                </a>
                </div> 
              -->

              <!-- login button -->
              <VBtn
                block
                color="primary"
                :disabled="!valid || processing"
                class="mt-4"
                @click="login"
              >
                <VProgressCircular
                  v-if="processing"
                  indeterminate
                  color="primary"
                  class="mr-2"
                  size="20"
                />
                Login
              </VBtn>
            </VCol>

            <!-- create account -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>Don't have an account?</span>
              <RouterLink
                class="text-primary ms-2"
                to="/register"
              >
                Create one here
              </RouterLink>
            </VCol>

            <VCol
              v-if="redirectMessage"
              cols="12"
              class="d-flex align-center"
            >
              <VDivider />
              <VDivider />
            </VCol>

            <!-- redirect message -->
            <VCardText class="text-center">
              <!-- TODO: Use v-dompurify-html -->
              <span v-html="redirectMessage" />
            </VCardText>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss">
@use '@core/scss/pages/page-auth.scss';
</style>
