import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useAppStore } from '@/store/app'
import { useUserStore } from '@/store/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const handleAuthRedirection = (to, from, next) => {
  const isLoggedIn = useUserStore().isLoggedIn

  const publicPaths = useAppStore().publicRoutes

  if (!isLoggedIn && !publicPaths.includes(to.path)) {
    console.log('Redirecting to login')
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (isLoggedIn && publicPaths.includes(to.path)) {
    console.log('Redirecting to home')
    return next({ path: '/' })
  }

  next()
}

router.beforeEach((to, from, next) => {
  handleAuthRedirection(to, from, next)
})

export default function (app) {
  app.use(router)
}
export { router }
