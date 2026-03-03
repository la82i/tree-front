<template>
  <q-layout view="hHh Lpr fFf" class="bg-primary">
    <q-header bordered class="bg-primary text-center text-brown-9 lt-md">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-weight-bold text-center"> 樹洞管理系統 </q-toolbar-title>
        <div style="width: 42px"></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above bordered class="bg-white text-brown-9" :width="240">
      <q-item class="q-py-md">
        <q-item-section avatar>
          <q-avatar size="40px">
            <img :src="`https://api.dicebear.com/9.x/croodles/svg?seed=${user.account}`" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-bold text-brown-9">{{ user.account }}</q-item-label>
          <q-item-label caption>管理員</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator inset />

      <q-list padding class="admin-nav q-mt-md mh-hide-scrollbar">
        <q-item
          v-for="nav in navs"
          :key="nav.to"
          :to="nav.to"
          clickable
          v-ripple
          exact
          class="q-mx-sm rounded-borders text-brown-9"
        >
          <q-item-section avatar>
            <q-icon :name="nav.icon" />
          </q-item-section>
          <q-item-section class="text-weight-bold">
            {{ nav.title }}
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" inset />

        <q-item clickable v-ripple @click="logout" class="q-mx-sm rounded-borders text-red-9">
          <q-item-section avatar>
            <q-icon name="o_logout" />
          </q-item-section>
          <q-item-section class="text-weight-bold">安全登出</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user'
import serviceUser from 'src/services/user'

const $q = useQuasar()
const router = useRouter()
const user = useUserStore()
const drawer = ref(false)

const navs = [
  { title: '商品管理', to: '/admin', icon: 'o_shopping_bag' },
  { title: '卡片管理', to: '/admin/cards', icon: 'o_style' },
  { title: '訂單管理', to: '/admin/orders', icon: 'o_receipt_long' },
  { title: '標籤管理', to: '/admin/moods', icon: 'o_mood' },
  { title: '回首頁', to: '/', icon: 'o_home' },
]

const toggleLeftDrawer = () => {
  drawer.value = !drawer.value
}

const logout = async () => {
  try {
    await serviceUser.logout()
    user.logout()
    router.push('/')
    $q.notify({ color: 'brown-9', message: '管理員已安全登出', position: 'top' })
  } catch (error) {
    console.error(error)
  }
}
</script>

<style lang="scss">
.admin-nav {
  .q-router-link--exact-active {
    color: #4e342e !important;
    background: #efebe9 !important;
    border-right: 4px solid #4e342e;

    .q-item__section--avatar {
      color: #4e342e !important;
    }
  }
}
</style>
