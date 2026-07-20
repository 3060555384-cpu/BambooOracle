import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomePage.vue') },
    { path: '/recognize', name: 'recognize', component: () => import('../views/RecognizePage.vue') },
    { path: '/community', name: 'community', component: () => import('../views/CommunityPage.vue') },
    { path: '/dictionary', name: 'dictionary', component: () => import('../views/DictionaryPage.vue') },
    { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('../views/NotFoundPage.vue') }
  ]
})

export default router
