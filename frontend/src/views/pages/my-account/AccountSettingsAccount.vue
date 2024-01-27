<script setup>
import { useUserStore } from '@/store/user'
import { ref } from 'vue'
import md5 from 'md5'
const userStore = useUserStore()
const user = userStore.user

const userDataLocal = ref(
  structuredClone({
    name: user.name,
    email: user.email,
  }),
)
const isAccountDeleted = ref(false)

const resetForm = () => {
  userDataLocal.value = structuredClone({
    name: user.name,
    email: user.email,
  })
}

// Generate the gravatar URL from the user's email
const gravatar = email => {
  const hash = md5(email.trim().toLowerCase())
  return `https://www.gravatar.com/avatar/${hash}`
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
          <VForm class="mt-6">
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
                />
              </VCol>

              <!-- Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn>Save changes</VBtn>

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

    <VCol cols="12">
      <!-- 👉 Delete Account -->
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
  </VRow>
</template>
