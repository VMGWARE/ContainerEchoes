<script setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue'
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'
</script>

<template>
  <!-- Dashboard -->
  <VerticalNavLink
    :item="{
      title: 'Dashboard',
      icon: 'ri-home-smile-line',
      to: '/dashboard',
    }"
  />

  <!-- 👉 Admin -->
  <VerticalNavSectionTitle
    :item="{
      heading: 'Admin',
    }"
  />

  <!-- Settings -->
  <VerticalNavLink
    :item="{
      title: 'Settings',
      icon: 'ri-settings-3-line',
      to: '/admin/settings',
    }"
  />

  <!-- System Info -->
  <VerticalNavLink :item="{ title: 'System Info', icon: 'ri-information-line', to: '/admin/system' }" />
</template>
