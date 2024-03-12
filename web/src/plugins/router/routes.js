export const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      // Default routes
      {
        path: 'dashboard',
        component: () => import('@/pages/dashboard.vue'),
      },
      {
        path: 'agents',
        component: () => import('@/pages/agents.vue'),
      },
      {
        path: 'logs',
        component: () => import('@/pages/logs.vue'),
      },
      {
        path: 'my-account',
        component: () => import('@/pages/my-account.vue'),
      },
      // Admin routes
      {
        path: 'admin/settings',
        component: () => import('@/pages/admin/settings.vue'),
      },
      {
        path: 'admin/system',
        component: () => import('@/pages/admin/system.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/blank.vue'),
    children: [
      {
        path: 'login',
        component: () => import('@/pages/login.vue'),
      },
      {
        path: 'register',
        component: () => import('@/pages/register.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        component: () => import('@/pages/[...error].vue'),
      },
    ],
  },
]
