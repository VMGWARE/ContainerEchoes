<template>
  <VRow
    align="center"
    justify="center"
  >
    <VCol>
      <!-- Data Sanitization -->
      <VRow>
        <VCol cols="12">
          <VCard
            class="pa-3"
            outlined
            tile
          >
            <VCardTitle class="headline"> Data Sanitization </VCardTitle>
            <VForm ref="sanitizationForm">
              <!-- Sanitize IP Addresses -->
              <VCol cols="12">
                <VSwitch
                  label="Sanitize IP Addresses"
                  outlined
                  dense
                />
              </VCol>

              <!-- Sanitize Email Addresses -->
              <VCol cols="12">
                <VSwitch
                  label="Sanitize Email Addresses"
                  outlined
                  dense
                />
              </VCol>

              <!-- Sanitize Domain Names -->
              <VCol cols="12">
                <VSwitch
                  label="Sanitize Domain Names"
                  outlined
                  dense
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  color="primary"
                  type="submit"
                >
                  Update Data Sanitization Settings
                </VBtn>
              </VCol>
            </VForm>
          </VCard>
        </VCol>
      </VRow>

      <VRow>
        <!-- Email Settings Section -->
        <VCol
          cols="12"
          md="6"
        >
          <VCard
            class="pa-4"
            outlined
            tile
          >
            <VCardTitle class="headline mb-3"> Email Configuration </VCardTitle>

            <!-- Sender Section -->
            <VSubheader>Sender</VSubheader>

            <!-- Sender Name -->
            <VCol cols="12">
              <VTextField
                v-model="data.email.fromName"
                label="Sender Name"
                outlined
                dense
              />
            </VCol>

            <!-- Sender Email -->
            <VCol cols="12">
              <VTextField
                v-model="data.email.fromAddress"
                label="Sender Email"
                outlined
                dense
              />
            </VCol>

            <!-- SMTP Settings Section -->
            <VSubheader>SMTP Settings</VSubheader>

            <!-- SMTP Host -->
            <VCol cols="12">
              <VTextField
                v-model="data.email.host"
                label="Host"
                outlined
                dense
              />
            </VCol>

            <!-- SMTP Port -->
            <VCol cols="12">
              <VTextField
                v-model="data.email.port"
                label="Port"
                type="number"
                outlined
                dense
                hint="Usually 465 (recommended), 587 or 25."
                persistent-hint
              />
            </VCol>

            <!-- Authentication -->

            <!-- SMTP Username -->
            <VCol cols="12">
              <VTextField
                v-model="data.email.user"
                label="Username"
                outlined
                dense
              />
            </VCol>

            <!-- SMTP Password -->
            <VCol cols="12">
              <VTextField
                v-model="data.email.pass"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
                :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="showPassword = !showPassword"
              />
            </VCol>

            <VCol cols="12">
              <VBtn
                color="primary"
                @click="updateEmailSettings"
              >
                Update Settings
              </VBtn>
            </VCol>
          </VCard>
        </VCol>

        <!-- RSA Keys Section -->
        <VCol
          cols="12"
          md="6"
        >
          <VCard
            class="pa-3"
            outlined
            tile
          >
            <VCardTitle class="headline"> RSA Keys </VCardTitle>
            <VForm
              ref="rsaForm"
              @submit.prevent="updateRSAKeys"
            >
              <VCol cols="12">
                <VTextarea
                  v-model="data.rsa.privateKey"
                  label="Private Key"
                  outlined
                  dense
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  v-model="data.rsa.publicKey"
                  label="Public Key"
                  outlined
                  dense
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  color="primary"
                  type="submit"
                >
                  Update RSA Keys
                </VBtn>
              </VCol>
            </VForm>
          </VCard>
        </VCol>
      </VRow>

      <VRow>
        <!-- Exceptionless Settings Section -->
        <VCol cols="12">
          <VCard
            class="pa-3"
            outlined
            tile
          >
            <VCardTitle class="headline"> Exceptionless Settings </VCardTitle>
            <VForm
              ref="exceptionlessForm"
              @submit.prevent="updateExceptionlessSettings"
            >
              <VCol cols="12">
                <VTextField
                  v-model="data.exceptionless.apiKey"
                  label="API Key"
                  outlined
                  dense
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  v-model="data.exceptionless.serverUrl"
                  label="Server URL"
                  outlined
                  dense
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  color="primary"
                  type="submit"
                >
                  Update Exceptionless Settings
                </VBtn>
              </VCol>
            </VForm>
          </VCard>
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>

<script>
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

export default {
  title: 'Settings - Admin',
  data() {
    return {
      data: {
        email: {
          host: '',
          port: '',
          user: '',
          pass: '',
          fromAddress: '',
          fromName: '',
        },
        rsa: {
          privateKey: '',
          publicKey: '',
        },
        exceptionless: {
          apiKey: '',
          serverUrl: '',
        },
      },
      showPassword: false,
      processing: false,
    }
  },
  mounted() {
    this.getSettings()
  },
  methods: {
    async updateEmailSettings() {
      this.processing = true

      // Prepare the settings to be updated
      const updatedSettings = {
        'email.host': this.data.email.host,
        'email.port': this.data.email.port,
        'email.user': this.data.email.user,
        'email.pass': this.data.email.pass,
        'email.fromAddress': this.data.email.fromAddress,
        'email.fromName': this.data.email.fromName,
      }

      try {
        // Add the Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

        // Send the PUT request to the backend
        const response = await axios.put('/admin/settings', updatedSettings)

        if (response.data.status === 'success') {
          // Handle success
          toast.success(response.data.message)
        } else {
          // Handle any other status
          toast.error(response.data.message)
        }
      } catch (error) {
        console.error('Failed to update settings:', error)
        toast.error(error.message)
      } finally {
        this.processing = false
      }
    },
    async updateRSAKeys() {
      this.processing = true

      // Prepare the settings to be updated
      const updatedSettings = {
        'rsa.privateKey': this.data.rsa.privateKey,
        'rsa.publicKey': this.data.rsa.publicKey,
      }

      try {
        // Add the Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

        // Send the PUT request to the backend
        const response = await axios.put('/admin/settings', updatedSettings)

        if (response.data.status === 'success') {
          // Handle success
          toast.success(response.data.message)
        } else {
          // Handle any other status
          toast.error(response.data.message)
        }
      } catch (error) {
        console.error('Failed to update settings:', error)
        toast.error(error.message)
      } finally {
        this.processing = false
      }
    },
    async updateExceptionlessSettings() {
      this.processing = true

      // Prepare the settings to be updated
      const updatedSettings = {
        'exceptionless.apiKey': this.data.exceptionless.apiKey,
        'exceptionless.serverUrl': this.data.exceptionless.serverUrl,
      }

      try {
        // Add the Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

        // Send the PUT request to the backend
        const response = await axios.put('/admin/settings', updatedSettings)

        if (response.data.status === 'success') {
          // Handle success
          toast.success(response.data.message)
        } else {
          // Handle any other status
          toast.error(response.data.message)
        }
      } catch (error) {
        console.error('Failed to update settings:', error)
        toast.error(error.message)
      } finally {
        this.processing = false
      }
    },
    async getSettings() {
      this.processing = true

      // Add the Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

      try {
        const response = await axios.get('/admin/settings')
        const settings = response.data.data

        this.processing = false

        // Dynamically update settings
        this.updateSettings(settings)
      } catch (error) {
        console.error('Failed to get settings:', error)
        this.processing = false
      }
    },
    updateSettings(settings) {
      settings.forEach(setting => {
        // Dynamically find the correct property path
        const path = setting.key.split('.')
        let currentLevel = this.data

        // Traverse the path to find the correct object to update
        for (let i = 0; i < path.length - 1; i++) {
          // Create nested objects if they don't exist
          currentLevel[path[i]] = currentLevel[path[i]] || {}
          currentLevel = currentLevel[path[i]]
        }

        // Set the value to the last key in the path
        currentLevel[path[path.length - 1]] = setting.value
      })
    },
  },
}
</script>
