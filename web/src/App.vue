<template>
  <VApp>
    <RouterView />
  </VApp>
</template>

<script>
import { useUserStore } from './store/user'
import { useAppStore } from '@/store/app'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

export default {
  data() {
    return {
      isLoading: true,
      tokenRefreshTimer: null,
    }
  },
  watch: {
    $route() {
      this.check_token()
    },
    useUserStore: {
      handler() {
        this.check_token()
      },
      deep: true,
    },
  },
  mounted() {
    this.check_token()
  },
  unmounted() {
    console.log('Remove token refresh timer')

    const timerId = localStorage.getItem('tokenRefreshTimer')
    if (timerId) {
      clearTimeout(timerId)
      localStorage.removeItem('tokenRefreshTimer')
    }
  },
  methods: {
    check_token() {
      console.log('Checking JWT token')

      const token = useUserStore().token
      if (!token || token == null || !useUserStore().user || useUserStore().user == null) {
        console.log('No token or user found')
        let redirect = window.location.pathname

        // Don't redirect to login page if already on login page
        if (useAppStore().publicRoutes.includes(redirect)) {
          console.log('Not redirecting to login page')
          this.isLoading = false

          return
        }

        // If redirect does not contain login or signup, redirect to login
        if (!useAppStore().publicRoutes.includes(redirect)) {
          redirect = '/login?redirect=' + redirect
        }

        this.isLoading = false

        // Redirect to login page
        this.$router.push(redirect)

        return
      }
      let exp
      try {
        const { exp: fixAttemptExp } = jwtDecode(token)

        exp = fixAttemptExp
      } catch (e) {
        console.log('Invalid token')
        this.isLoading = false
        this.logout()

        return
      }
      console.log('Your JWT is', exp - Date.now() / 1000, 'seconds to expiry')
      if (exp - Date.now() / 1000 < 0) {
        console.log('Token has expired')
        clearTimeout(this.tokenRefreshTimer)
        this.isLoading = false
        this.logout()

        return
      }
      if (exp - Date.now() / 1000 < 600 && exp - Date.now() / 1000 > 0) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        axios({
          method: 'post',
          url: '/api/auth/refresh-token',
        }).then(response => {
          this.$store.commit('setToken', response.data.data.token)
          localStorage.setItem('token', response.data.data.token)
          console.log('token refreshed')
        })
        this.isLoading = false
      } else {
        this.isLoading = false
        console.log('token not expired yet')
        this.setupTokenRefresh()
      }
    },
    setupTokenRefresh() {
      console.log('Setup token refresh')

      // Clear any existing timer before setting up a new one
      const existingTimerId = localStorage.getItem('tokenRefreshTimer')
      if (existingTimerId) {
        console.log('Clearing existing timer', existingTimerId)
        clearTimeout(existingTimerId)
        localStorage.removeItem('tokenRefreshTimer')
      }

      // Setup new timer
      const token = useUserStore().token
      const { exp } = jwtDecode(token)
      const newTimerId = setTimeout(this.check_token, (exp - Date.now() / 1000 - 600) * 1000)

      // Store new timer ID in localStorage
      localStorage.setItem('tokenRefreshTimer', newTimerId)

      console.log('New token refresh timer set for', exp - Date.now() / 1000 - 600, 'seconds, timerId:', newTimerId)
    },
    logout() {
      this.isLoading = true
      useUserStore().logout()

      // Redirect to login page
      this.isLoading = false
      this.$router.push('/login')
    },
  },
}
</script>
