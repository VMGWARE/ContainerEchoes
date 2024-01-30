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

  <!-- Agents -->
  <VerticalNavLink
    :item="{
      title: 'Agents',
      icon: 'ri-user-3-line',
      to: '/agents',
    }"
  />

  <!-- Containers -->
  <VerticalNavLink
    :item="{
      title: 'Containers',
      icon: 'ri-server-line',
      to: '/containers',
    }"
  />

  <!-- Global Logs -->
  <VerticalNavLink
    :item="{
      title: 'Global Logs',
      icon: 'ri-file-list-3-line',
      to: '/logs',
    }"
  />

  <!-- Admin -->
  <VerticalNavSectionTitle
    :item="{
      heading: 'Admin',
    }"
  />

  <!-- Access Control -->
  <VerticalNavGroup
    :item="{
      title: 'Access Control',
      icon: 'ri-shield-user-line',
    }"
  >
    <VerticalNavLink
      :item="{
        title: 'Roles',
        icon: 'ri-user-3-line',
        to: '/admin/roles',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Permissions',
        icon: 'ri-shield-user-line',
        to: '/admin/permissions',
      }"
    />
  </VerticalNavGroup>

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
