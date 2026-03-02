<template>
  <q-card
    flat
    bordered
    class="product-card cursor-pointer no-shadow overflow-hidden"
    :class="mode === 'mini' ? 'mini-card row no-wrap' : 'standard-card column'"
    @click="goToDetail"
  >
    <template v-if="mode === 'mini'">
      <div class="col-4 flex flex-center">
        <q-img
          :src="imageUrl || 'https://placehold.co/400x500?text=No+Image'"
          fit="contain"
          style="width: 100%; height: 180px"
        />
      </div>

      <div class="col-8 q-pa-md justify-center bg-grey-1 ellipsis-3-lines text-center">
        <div class="text-subtitle1 text-bold text-brown-9 ellipsis-2-lines q-mb-xs">
          {{ name }}
        </div>
        <div class="text-subtitle2 text-bold text-brown-9 q-mb-sm">
          {{ formattedPrice }}
        </div>
        <div class="text-caption text-grey-8 ellipsis-6-lines book-description">
          {{ description || '溫柔馥郁的靈魂演繹。' }}
        </div>
      </div>
    </template>

    <template v-else>
      <q-img
        :src="imageUrl"
        fit="contain"
        ratio="0.85"
        style="width: 90%; height: auto"
        class="q-my-xs self-center"
      />
      <q-card-section class="text-center column">
        <div class="text-subtitle1 text-bold text-brown-9" style="height: 2em; overflow: hidden">
          {{ name }}
        </div>
        <div class="text-caption text-grey-8 q-px-md q-pt-md ellipsis-3-lines">
          {{ cleanDescription }}
        </div>
        <div class="text-subtitle1 text-bold text-brown-9 q-mt-md">{{ formattedPrice }}</div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg q-pt-none">
        <q-btn
          unelevated
          color="brown-10"
          text-color="white"
          label="添加至購物車"
          class="mh-btn-action"
          @click.stop="addCart"
        />
      </q-card-actions>
    </template>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user'
import serviceUser from 'src/services/user'

const props = defineProps(['_id', 'imageUrl', 'name', 'price', 'moods', 'description', 'mode'])
const router = useRouter()
const $q = useQuasar()
const user = useUserStore()

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(props.price)
})

const cleanDescription = computed(() => {
  if (!props.description) return '溫柔馥郁的靈魂演繹。'
  return props.description.replace(/\s+/g, ' ').trim()
})

const addCart = async () => {
  if (!user.isLoggedIn) {
    $q.notify({ color: 'warning', message: '請先登入' })
    return router.push('/login')
  }
  try {
    const { data } = await serviceUser.cart({
      product: props._id,
      quantity: 1,
      replace: false,
    })
    user.cart = data.result
    $q.notify({
      color: 'positive',
      icon: 'done',
      message: `已將「${props.name}」加入購物車`,
    })
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'negative', message: '加入購物車失敗' })
  }
}
const goToDetail = () => router.push(`/product/${props._id}`)
</script>

<style lang="scss" scoped>
.product-card {
  border: 1px solid #f0f0f0;
  background: transparent;
  transition: all 0.3s ease;
  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
}

.book-description {
  text-align: justify;
  line-height: 1.6;
  white-space: normal;
  word-break: break-all;
  height: 4.5em;
}

.mini-card {
  width: 100% !important;
  height: 200px;
}

.standard-card {
  width: 100%;
  height: 100%;
}
</style>
