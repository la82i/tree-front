<template>
  <q-layout view="hHh LpR fff" class="text-brown-9">
    <q-header class="bg-primary text-brown-9" height-hint="150">
      <div class="row justify-center q-py-md gt-sm">
        <router-link to="/" class="logo">
          <div class="text-h4 text-weight-bolder">心靈樹洞</div>
        </router-link>
      </div>

      <q-toolbar class="q-px-md q-px-md-xl text-brown-9">
        <div class="row items-center" style="min-width: 110px">
          <q-btn
            flat
            round
            icon="o_menu"
            class="lt-md text-brown-9"
            size="sm"
            @click="leftDrawerOpen = !leftDrawerOpen"
          />
        </div>

        <q-toolbar-title class="row justify-center no-pointer-events">
          <div class="gt-sm row q-gutter-xl all-pointer-events">
            <q-btn
              v-for="nav in navs"
              :key="nav.to"
              v-show="nav.show"
              :label="nav.title"
              :to="nav.to"
              class="nav-btn text-brown-9"
              flat
              no-caps
            />
          </div>

          <router-link to="/" class="logo lt-md absolute-center text-brown-9 all-pointer-events">
            <div class="text-weight-bolder" style="letter-spacing: 2px">心靈樹洞</div>
          </router-link>
        </q-toolbar-title>

        <div class="row items-center justify-end q-gutter-sm" style="min-width: 110px">
          <q-btn
            v-if="user.isLoggedIn"
            flat
            round
            icon="o_shopping_cart"
            to="/cart"
            size="sm"
            class="text-brown-9"
          >
            <q-badge v-if="user.cart > 0" color="brown-5" floating rounded>{{ user.cart }}</q-badge>
          </q-btn>
          <q-btn
            flat
            round
            icon="o_person"
            size="sm"
            @click="rightDrawerOpen = !rightDrawerOpen"
            class="text-brown-9"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      class="bg-primary text-brown-9"
      behavior="mobile"
    >
      <q-list class="q-pt-md">
        <div class="row justify-end q-pa-sm">
          <q-btn icon="o_close" size="sm" flat round dense @click="leftDrawerOpen = false" />
        </div>
        <q-item-label header class="text-center text-brown-9 text-bold text-h6"
          >心靈樹洞</q-item-label
        >
        <q-separator class="q-my-md bg-brown-2" inset />

        <q-item
          v-for="nav in navs"
          :key="nav.to"
          v-show="nav.show"
          clickable
          :to="nav.to"
          class="text-brown-9"
          active-class="text-brown-10 bg-brown-2"
        >
          <q-item-section avatar
            ><q-icon :name="nav.icon" color="brown-9" size="sm"
          /></q-item-section>
          <q-item-section class="text-bold">{{ nav.title }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-drawer
      v-model="rightDrawerOpen"
      side="right"
      bordered
      overlay
      behavior="mobile"
      class="bg-primary text-brown-9"
    >
      <div class="row justify-end q-pa-sm">
        <q-btn icon="o_close" size="sm" flat round dense @click="rightDrawerOpen = false" />
      </div>

      <div v-if="!user.isLoggedIn" class="q-pa-lg">
        <div class="text-h6 text-center q-mb-xl">登入您的帳戶</div>
        <q-btn
          unelevated
          color="brown-9"
          label="立即登入"
          to="/login"
          class="full-width q-mb-md mh-btn-action"
        />
        <q-btn
          outline
          color="brown-9"
          label="建立帳戶"
          to="/register"
          class="full-width no-border-radius"
        />
      </div>

      <q-list v-else padding class="text-brown-9">
        <q-item-label header class="text-center text-brown-10 text-bold text-h6"
          >我的帳戶</q-item-label
        >
        <q-item-label header class="text-center q-pt-none text-brown-8"
          >{{ user.account }}，您好</q-item-label
        >

        <q-separator class="q-my-md bg-brown-2" inset />

        <q-item clickable to="/orders" active-class="text-brown-10 bg-brown-2">
          <q-item-section avatar><q-icon name="o_list_alt" color="brown-9" /></q-item-section>
          <q-item-section>訂單查詢</q-item-section>
        </q-item>

        <q-item v-if="user.isAdmin" clickable to="/admin" class="text-brown-10">
          <q-item-section avatar>
            <q-icon name="o_admin_panel_settings" color="brown-10" />
          </q-item-section>
          <q-item-section class="text-bold">系統管理</q-item-section>
        </q-item>

        <q-item clickable @click="logout" class="text-red-9 q-mt-xl">
          <q-item-section avatar>
            <q-icon name="o_logout" color="red-9" />
          </q-item-section>
          <q-item-section>安全登出</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>

    <q-footer class="bg-primary text-brown-9 q-py-lg">
      <div class="mh-container mx-auto q-px-md">
        <div class="row justify-center">
          <div class="col-12 col-md-10 text-center">
            <div class="text-subtitle1 text-weight-medium">
              在這個角落，你的每一份情緒都值得被溫柔傾聽，<br />
              探索情緒，與真實的自己對話。
            </div>
          </div>
        </div>

        <q-separator class="q-my-sm bg-brown-2" />

        <div class="text-center text-caption text-brown-7 text-weight-regular line-height-18">
          本站提供之解讀僅供參考，若有心理健康需求，請尋求專業諮詢，<br />
          讓我們在安全的前提下探索自己。
        </div>
        <div class="text-center text-caption text-brown-7 text-weight-regular letter-spacing-1">
          © 2026 心靈樹洞 MindHollow. All rights reserved.
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user'
import serviceUser from 'src/services/user'

const $q = useQuasar()
const router = useRouter()
const user = useUserStore()
const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

const navs = computed(() => [
  { title: '每日抽卡', to: '/', icon: 'o_style', show: true },
  { title: '樹洞日記', to: '/diary', icon: 'o_auto_stories', show: true },
  { title: '樹洞書屋', to: '/product', icon: 'o_menu_book', show: true },
  { title: '訂單查詢', to: '/orders', icon: 'o_receipt_long', show: user.isLoggedIn },
])

const logout = async () => {
  try {
    await serviceUser.logout()
  } catch (error) {
    console.error('Logout API Error:', error)
  }
  user.logout()
  rightDrawerOpen.value = false
  router.push('/')
  $q.notify({
    message: '您已成功登出',
    color: 'brown-9',
    icon: 'done',
    position: 'top',
    timeout: 2000,
  })
}
</script>

<style lang="scss">
.logo {
  text-decoration: none;
  color: inherit;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 0.7;
  }
}

.text-h4 {
  letter-spacing: 8px;
}

.nav-btn {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(78, 52, 46, 0.05) !important;
  }
}
</style>
