import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { useUserStore } from 'src/stores/user'
import serviceUser from 'src/services/user'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: setupLayouts(routes),

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from, next) => {
    const user = useUserStore()

    // 💡 關鍵：只有當「有 token」但「沒帳號名字」時（代表剛重整頁面），才去抓後端資料
    // 這樣你在頁面內「加入購物車」得到的 3，才不會被跳轉頁面時洗掉！
    if (user.token && !user.account) {
      try {
        const { data } = await serviceUser.profile()
        user.login(data.result)
      } catch (error) {
        console.log(error)
        user.logout()
      }
    }

    // 權限判斷部分不變
    if (to.meta.login === 'no-login-only' && user.isLoggedIn) {
      next('/')
    } else if (to.meta.login === 'login-only' && !user.isLoggedIn) {
      next('/login')
    } else if (to.meta.admin && !user.isAdmin) {
      next('/')
    } else {
      next()
    }
  })

  Router.afterEach((to) => {
    document.title = to.meta.title ? ` ${to.meta.title || ''} | 心靈樹洞 ` : '心靈樹洞'
  })
  return Router
})
