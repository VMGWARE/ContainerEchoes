<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer app v-model="drawer" clipped>
      <v-list dense>
        <!-- Drawer items here -->
        <v-list-item link>
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- More drawer items... -->
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Container Echoes</v-toolbar-title>
      <!-- Additional items can be added here -->
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: null,
  }),
  watch: {
    $route(route) {
      if (route.name !== "home") {
        this.drawer = false;
      }
    },
  },
};
</script>

<style>
/* Add any additional custom styling here */
</style>
