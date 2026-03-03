<template>
  <q-page class="q-pa-xl bg-primary">
    <div class="mh-container">
      <div class="text-h4 text-brown-9 q-mb-lg text-center">購物車</div>
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-8">
          <div v-if="cart.length > 0" class="row q-col-gutter-md">
            <div
              v-for="(item, i) in cart"
              :key="item.product._id"
              class="col-12 col-sm-6 col-md-12"
            >
              <q-card
                flat
                bordered
                class="bg-white rounded-card shadow-1 item-hover full-height column"
                :class="{ 'bg-red-1': !item.product.sell }"
              >
                <q-card-section class="q-pa-md col">
                  <div class="row items-center no-wrap">
                    <q-avatar
                      rounded
                      size="80px"
                      class="cursor-pointer flex-shrink-0"
                      @click="router.push('/product/' + item.product._id)"
                    >
                      <q-img :src="item.product.imageUrl" fit="contain" ratio="1" />
                    </q-avatar>

                    <div class="q-pl-md col">
                      <div class="text-subtitle1 text-bold text-brown-10 ellipsis">
                        {{ item.product.name }}
                      </div>
                      <div class="text-caption text-grey-7">$ {{ item.product.price }}</div>
                      <div v-if="!item.product.sell" class="text-red text-caption text-bold">
                        此商品已下架
                      </div>
                    </div>
                  </div>

                  <div class="row items-center justify-between q-mt-md">
                    <div class="row items-center q-gutter-x-sm">
                      <q-btn
                        outline
                        round
                        size="xs"
                        icon="remove"
                        @click="updateCart(item.quantity - 1, item, i)"
                      />
                      <span class="text-body1 q-px-sm">{{ item.quantity }}</span>
                      <q-btn
                        outline
                        round
                        size="xs"
                        icon="add"
                        @click="updateCart(item.quantity + 1, item, i)"
                      />
                    </div>

                    <div class="text-subtitle1 text-weight-bold text-brown-9">
                      $ {{ (item.product.price * item.quantity).toLocaleString() }}
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right" class="q-pa-sm">
                  <q-btn
                    flat
                    round
                    color="grey-4"
                    text-color="grey-7"
                    icon="o_delete"
                    size="sm"
                    @click="updateCart(0, item, i)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>

          <div v-else class="column items-center q-pt-xl text-grey-6">
            <q-icon name="o_shopping_basket" size="100px" />
            <p class="text-h6 q-mt-md">您的收藏盒目前是空的</p>
            <q-btn outline label="前往探索" color="brown-5" to="/" class="q-mt-md" />
          </div>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered class="q-pa-lg bg-white sticky-summary">
            <div class="text-subtitle2 text-grey-7 q-mb-lg">訂單摘要</div>

            <div class="row justify-between q-mb-sm">
              <span class="text-grey-8">商品小計</span>
              <span class="text-weight-medium">$ {{ totalPrice.toLocaleString() }}</span>
            </div>

            <div class="row justify-between q-mb-lg border-bottom q-pb-md">
              <span class="text-grey-8">運費</span>
              <span class="text-green-7 text-weight-bold">免運費</span>
            </div>

            <div class="row justify-between text-h5 text-weight-bolder q-mb-xl text-brown-10">
              <span>總計</span>
              <span>$ {{ totalPrice.toLocaleString() }}</span>
            </div>

            <q-btn
              unelevated
              color="brown-10"
              text-color="white"
              label="前往結帳"
              class="full-width q-py-md mh-btn-action"
              size="md"
              :disabled="checkoutDisable"
              @click="checkout"
            />

            <div class="text-caption text-grey-5 q-mt-md text-center">
              運費將於下一個步驟計算（如有需要）。
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import serviceOrder from 'src/services/order'
import serviceUser from 'src/services/user'
import { useUserStore } from 'src/stores/user'

const $q = useQuasar()
const user = useUserStore()
const router = useRouter()
const cart = ref([])

const getCart = async () => {
  try {
    const { data } = await serviceUser.getCart()
    cart.value = data.result.filter((item) => item.product !== null)
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'red', message: '讀取收藏失敗' })
  }
}

const updateCart = async (value, item, i) => {
  if (value <= 0) {
    $q.dialog({
      title: '移除確認',
      message: `確定要將「${item.product.name}」從購物車移除嗎？`,
      cancel: { flat: true, color: 'grey' },
      ok: { flat: true, color: 'red-7', label: '確認移除' },
      persistent: true,
    }).onOk(async () => {
      await sendUpdate(0, item, i)
    })
  } else {
    await sendUpdate(value, item, i)
  }
}

const sendUpdate = async (value, item, i) => {
  try {
    const { data } = await serviceUser.cart({
      product: item.product._id,
      quantity: value,
      replace: true,
    })

    user.cart = data.result

    if (value <= 0) {
      cart.value.splice(i, 1)
    } else {
      cart.value[i].quantity = value
    }
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'red', message: '更新失敗' })
  }
}

const totalPrice = computed(() => {
  return cart.value.reduce((total, item) => total + item.product.price * item.quantity, 0)
})

const checkoutDisable = computed(() => {
  return cart.value.length === 0 || cart.value.some((item) => !item.product.sell)
})

const checkout = async () => {
  try {
    const { data } = await serviceOrder.create()
    user.cart = 0
    router.push('/orders')
    $q.notify({
      color: 'green',
      message: `結帳成功！訂單 ID: ${data.result._id}`,
    })
  } catch (error) {
    console.log(error)
    const text = error?.response?.data?.message || '結帳發生錯誤'
    $q.notify({ color: 'red', message: text })
  }
}

onMounted(getCart)
</script>

<style lang="scss" scoped>
.sticky-summary {
  position: sticky;
  top: 100px;
}

.rounded-card {
  border-radius: 4px;
}
.border-bottom {
  border-bottom: 1px solid #efefef;
}
.item-hover {
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06) !important;
  }
}
</style>

<route lang="yaml">
meta:
  title: '購物車'
  login: login-only
</route>
