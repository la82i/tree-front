<template>
  <q-page class="q-pa-lg bg-primary">
    <div v-if="!product.sell" class="fullscreen z-top bg-black-7 flex flex-center">
      <div class="text-center text-white q-pa-xl bg-brown-9 rounded-borders shadow-20">
        <q-icon name="error_outline" size="100px" />
        <div class="text-h4 q-mt-md">此商品已下架</div>
        <q-btn
          to="/"
          label="回樹洞首頁"
          color="white"
          text-color="brown-9"
          unelevated
          rounded
          class="q-mt-xl"
        />
      </div>
    </div>

    <div class="mh-container">
      <div class="row q-col-gutter-xl q-py-xl justify-center">
        <div class="col-12 col-md-4">
          <q-card flat bordered class="rounded-borders overflow-hidden shadow-1">
            <q-img :src="product.imageUrl" fit="contain" />
          </q-card>
        </div>

        <div class="col-12 col-md-6 column justify-between">
          <div class="text-center">
            <div class="text-h5 text-weight-bolder text-brown-9 q-mb-md">{{ product.name }}</div>
            <q-separator />
            <div class="row q-gutter-xs q-my-md justify-center">
              <q-chip
                v-for="m in product.moods"
                :key="m._id"
                color="brown-2"
                text-color="brown-9"
                size="md"
              >
                # {{ m.name }}
              </q-chip>
            </div>
            <div>
              <div class="text-h5 text-brown-9 q-mb-md">NT$ {{ product.price }}</div>
              <div class="text-h6 text-brown-8 q-mb-sm">作者:{{ product.author }}</div>
              <div class="text-h6 text-brown-7 q-mb-xl">出版社:{{ product.publisher }}</div>
            </div>
          </div>

          <div class="q-pa-md rounded-borders">
            <div class="row q-col-gutter-sm items-center">
              <div class="col-4">
                <q-input
                  v-model.number="quantity"
                  type="number"
                  square
                  outlined
                  dense
                  label="數量"
                  :rules="[(val) => val > 0 || '最少為 1']"
                  hide-bottom-space
                />
              </div>
              <div class="col-8">
                <q-btn
                  unelevated
                  color="brown-10"
                  text-color="white"
                  icon="shopping_cart"
                  label="添加至購物車"
                  class="mh-btn-action full-width"
                  @click="addCart"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="product.quote" class="col-12 text-subtitle2 text-grey-8 q-my-lg quote-text">
          {{ product.quote }}
        </div>

        <div class="col-12">
          <q-separator color="brown-3" style="height: 1px" />
        </div>

        <div class="col-12 text-subtitle1 text-grey-8 q-my-lg description-text">
          {{ cleanDescription }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import serviceProduct from 'src/services/product'
import serviceUser from 'src/services/user'
import { useUserStore } from 'src/stores/user'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const user = useUserStore()

const product = ref({
  name: '',
  price: 0,
  description: '',
  quote: '',
  author: '',
  publisher: '',
  moods: [],
  sell: true,
  imageUrl: '',
})
const quantity = ref(1)

const cleanDescription = computed(() => {
  return product.value.description || '暫無描述。'
})

const getProduct = async () => {
  try {
    const { data } = await serviceProduct.getId(route.params.id)
    product.value = data.result
    document.title = `樹洞書屋 | ${product.value.name}`
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'negative', message: '找不到該商品' })
    router.push('/')
  }
}

const addCart = async () => {
  if (!user.isLoggedIn) {
    $q.notify({ color: 'warning', message: '請先登入' })
    return router.push('/login')
  }
  try {
    const { data } = await serviceUser.cart({
      product: product.value._id,
      quantity: quantity.value,
      replace: false,
    })
    user.cart = data.result
    $q.notify({ color: 'positive', icon: 'done', message: '成功加入購物車' })
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'negative', message: '加入購物車失敗' })
  }
}

onMounted(getProduct)
</script>

<style lang="scss" scoped>
.description-text {
  line-height: 1.8;
  text-align: justify;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

.quote-text {
  line-height: 1.8;
  text-align: center;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
</style>
