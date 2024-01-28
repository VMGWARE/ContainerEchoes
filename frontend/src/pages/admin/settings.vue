<template>
  <v-row
    align="center"
    justify="center"
  >
    <v-col>
      <v-row>
        <!-- Email Settings Section -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            class="pa-4"
            outlined
            tile
          >
            <v-card-title class="headline mb-3">Configuration</v-card-title>

            <!-- Sender Section -->
            <v-subheader>Sender</v-subheader>

            <!-- Sender Name -->
            <VCol cols="12">
              <v-text-field
                label="Sender Name"
                v-model="data.email.fromName"
                outlined
                dense
              ></v-text-field>
            </VCol>

            <!-- Sender Email -->
            <VCol cols="12">
              <v-text-field
                label="Sender Email"
                v-model="data.email.fromAddress"
                outlined
                dense
              ></v-text-field>
            </VCol>

            <!-- SMTP Settings Section -->
            <v-subheader>SMTP Settings</v-subheader>

            <!-- SMTP Host -->
            <VCol cols="12">
              <v-text-field
                label="Host"
                v-model="data.email.host"
                outlined
                dense
              ></v-text-field>
            </VCol>

            <!-- SMTP Port -->
            <VCol cols="12">
              <v-text-field
                label="Port"
                v-model="data.email.port"
                type="number"
                outlined
                dense
                hint="Usually 465 (recommended), 587 or 25."
                persistent-hint
              ></v-text-field>
            </VCol>

            <!-- Authentication -->

            <!-- SMTP Username -->
            <VCol cols="12">
              <v-text-field
                label="Username"
                v-model="data.email.user"
                outlined
                dense
              ></v-text-field>
            </VCol>

            <!-- SMTP Password -->
            <VCol cols="12">
              <v-text-field
                label="Password"
                v-model="data.email.pass"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
                :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="showPassword = !showPassword"
              ></v-text-field>
            </VCol>

            <VCol cols="12">
              <v-btn
                color="primary"
                @click="updateEmailSettings"
                >Update Settings</v-btn
              ></VCol
            >
          </v-card>

          <!-- <v-card
            class="pa-3"
            outlined
            tile
          >
            <v-card-title class="headline">Email Settings</v-card-title>
            <v-form
              ref="emailForm"
              @submit.prevent="updateEmailSettings"
            >
              <VRow>
                <VCol cols="12">
                  <v-text-field
                    label="Host"
                    v-model="data.email.host"
                    outlined
                    dense
                  ></v-text-field>
                </VCol>

                <VCol cols="12">
                  <v-text-field
                    label="Port"
                    v-model="data.email.port"
                    outlined
                    dense
                  ></v-text-field>
                </VCol>

                <VCol cols="12">
                  <v-text-field
                    label="Username"
                    v-model="data.email.user"
                    outlined
                    dense
                  ></v-text-field>
                </VCol>

                <VCol cols="12">
                  <v-text-field
                    label="Password"
                    v-model="data.email.pass"
                    type="password"
                    outlined
                    dense
                  ></v-text-field>
                </VCol>

                <VCol cols="12">
                  <v-text-field
                    label="From Address"
                    v-model="data.email.fromAddress"
                    outlined
                    dense
                  ></v-text-field>
                </VCol>

                <VCol cols="12">
                  <v-text-field
                    label="From Name"
                    v-model="data.email.fromName"
                    outlined
                    dense
                  ></v-text-field>
                </VCol>

                <VCol cols="12">
                  <v-btn
                    color="primary"
                    type="submit"
                    >Update Email Settings</v-btn
                  >
                </VCol>
              </VRow>
            </v-form>
          </v-card> -->
        </v-col>

        <!-- RSA Keys Section -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            class="pa-3"
            outlined
            tile
          >
            <v-card-title class="headline">RSA Keys</v-card-title>
            <v-form
              ref="rsaForm"
              @submit.prevent="updateRSAKeys"
            >
              <VCol cols="12">
                <v-textarea
                  label="Private Key"
                  v-model="data.rsa.privateKey"
                  outlined
                  dense
                ></v-textarea
              ></VCol>

              <VCol cols="12">
                <v-textarea
                  label="Public Key"
                  v-model="data.rsa.publicKey"
                  outlined
                  dense
                ></v-textarea
              ></VCol>

              <VCol cols="12">
                <v-btn
                  color="primary"
                  type="submit"
                  >Update RSA Keys</v-btn
                ></VCol
              >
            </v-form>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <!-- Exceptionless Settings Section -->
        <v-col cols="12">
          <v-card
            class="pa-3"
            outlined
            tile
          >
            <v-card-title class="headline">Exceptionless Settings</v-card-title>
            <v-form
              ref="exceptionlessForm"
              @submit.prevent="updateExceptionlessSettings"
            >
              <VCol cols="12">
                <v-text-field
                  label="API Key"
                  v-model="data.exceptionless.apiKey"
                  outlined
                  dense
                ></v-text-field
              ></VCol>

              <VCol cols="12">
                <v-text-field
                  label="Server URL"
                  v-model="data.exceptionless.serverUrl"
                  outlined
                  dense
                ></v-text-field
              ></VCol>

              <VCol cols="12">
                <v-btn
                  color="primary"
                  type="submit"
                  >Update Exceptionless Settings</v-btn
                ></VCol
              >
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import axios from 'axios'

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
    }
  },
  methods: {
    async updateEmailSettings() {
      // Logic to update email settings
    },
    async updateRSAKeys() {
      // Logic to update RSA keys
    },
    async updateExceptionlessSettings() {
      // Logic to update Exceptionless settings
    },
  },
  mounted() {
    // Fetch current settings from API and populate the form fields
  },
}
</script>

<style scoped>
/* Add any additional styling here */
</style>
