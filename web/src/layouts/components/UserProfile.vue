<script setup>
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const router = useRouter()
import md5 from 'md5'

const userStore = useUserStore()
const user = userStore.user

// Generate the gravatar URL from the user's email
const gravatar = email => {
  const hash = md5(email.trim().toLowerCase())
  
  return `https://www.gravatar.com/avatar/${hash}`
}

const logout = () => {
  userStore.logout()
  router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
}
</script>

<template>
  <VAvatar
    class="cursor-pointer"
    color="primary"
    variant="tonal"
  >
    <VImg :src="gravatar(user.email)" />

    <!-- SECTION Menu -->
    <VMenu
      activator="parent"
      width="230"
      location="bottom end"
      offset="14px"
    >
      <VList>
        <!-- 👉 User Avatar & Name -->
        <VListItem>
          <template #prepend>
            <VListItemAction start>
              <VAvatar
                color="primary"
                variant="tonal"
              >
                <VImg :src="gravatar(user.email)" />
              </VAvatar>
            </VListItemAction>
          </template>

          <VListItemTitle class="font-weight-semibold">
            {{ user.name }}
          </VListItemTitle>
          <VListItemSubtitle>
            {{ user.superuser ? 'Superuser' : 'User' }}
          </VListItemSubtitle>
        </VListItem>
        <VDivider class="my-2" />

        <!-- 👉 My account -->
        <VListItem
          link
          to="/my-account"
        >
          <template #prepend>
            <VIcon
              class="me-2"
              icon="ri-user-line"
              size="22"
            />
          </template>

          <VListItemTitle>My account</VListItemTitle>
        </VListItem>

        <!-- 👉 Admin Settings -->
        <VListItem link>
          <template #prepend>
            <VIcon
              class="me-2"
              icon="ri-settings-4-line"
              size="22"
            />
          </template>

          <VListItemTitle>Admin Settings</VListItemTitle>
        </VListItem>

        <!-- Divider -->
        <VDivider class="my-2" />

        <!-- 👉 Logout -->
        <VListItem
          link
          @click="logout"
        >
          <template #prepend>
            <VIcon
              class="me-2"
              icon="ri-logout-box-r-line"
              size="22"
            />
          </template>

          <VListItemTitle>Logout</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
    <!-- !SECTION -->
  </VAvatar>
</template>
