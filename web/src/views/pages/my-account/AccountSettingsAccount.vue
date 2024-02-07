<script>
import { useUserStore } from '@/store/user'
import md5 from 'md5'

const userStore = useUserStore()
const user = userStore.user
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

export default {
  title: 'My Account',
  data() {
    return {
      valid: false,
      user,
      userDataLocal: {
        name: user.name,
        email: user.email,
      },
      isAccountDeleted: false,
      nameRules: [v => !!v || 'Name is required'],
      emailRules: [v => !!v || 'Email is required'],
      processing: false,
    }
  },
  methods: {
    resetForm() {
      this.userDataLocal = structuredClone({
        name: user.name,
        email: user.email,
      })
    },
    gravatar(email) {
      const hash = md5(email.trim().toLowerCase())

      return `https://www.gravatar.com/avatar/${hash}`
    },
    async update() {
      // Set processing to true
      this.processing = true

      if (this.valid) {
        try {
          // Add the Authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

          const response = await axios.patch('/auth/me', {
            name: this.userDataLocal.name,
            email: this.userDataLocal.email,
          })

          var resp = response.data

          if (resp.code != 200) {
            // Set processing to true
            this.processing = false
            toast.error(resp.message)
          } else {
            // Set processing to true
            this.processing = false
            toast.success(resp.message)
            user.name = this.userDataLocal.name
            user.email = this.userDataLocal.email
            this.resetForm()

            // TODO: Update user data in the store
          }
        } catch (error) {
          // Set processing to true
          this.processing = false
          toast.error(error.message)
        }
      }
    },
  },
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Account Details">
        <VCardText class="d-flex">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6"
            :image="gravatar(user.email)"
          />
        </VCardText>

        <VDivider />

        <VCardText>
          <!-- 👉 Form -->
          <VForm
            v-model="valid"
            class="mt-6"
            @submit.prevent="() => {}"
          >
            <VRow>
              <!-- Name -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="userDataLocal.name"
                  label="Name"
                  placeholder="John Doe"
                  :rules="nameRules"
                  required
                />
              </VCol>

              <!-- Email -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="userDataLocal.email"
                  label="E-mail"
                  placeholder="johndoe@gmail.com"
                  type="email"
                  :rules="emailRules"
                  required
                />
              </VCol>

              <!-- Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn
                  :disabled="!valid || processing"
                  @click="update"
                >
                  <VProgressCircular
                    v-if="processing"
                    indeterminate
                    color="primary"
                    class="mr-2"
                    size="20"
                  />
                  Save changes
                </VBtn>

                <VBtn
                  color="secondary"
                  variant="outlined"
                  type="reset"
                  @click.prevent="resetForm"
                >
                  Reset
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <!--
      <VCol cols="12">
      <VCard title="Delete Account">
      <VCardText>
      <div>
      <VCheckbox
      v-model="isAccountDeleted"
      label="I confirm my account deletion"
      />
      </div>

      <VBtn
      :disabled="!isAccountDeleted"
      color="error"
      class="mt-3"
      >
      Delete Account
      </VBtn>
      </VCardText>
      </VCard>
      </VCol>
    -->
  </VRow>
</template>
