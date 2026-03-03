<template>
  <q-page class="q-pa-xl bg-primary">
    <div class="mh-container">
      <div class="text-h4 text-brown-9 q-mb-lg text-center">購物車</div>
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-8">
          <q-list v-if="cart.length > 0" class="q-gutter-y-md">
            <q-item
              v-for="(item, i) in cart"
              :key="item.product._id"
              class="bg-white q-pa-lg rounded-card shadow-1 item-hover"
              :class="{ 'bg-red-1': !item.product.sell }"
            >
              <q-item-section avatar>
                <q-avatar
                  rounded
                  size="100px"
                  class="cursor-pointer"
                  @click="router.push('/product/' + item.product._id)"
                >
                  <q-img
                    :src="item.product.imageUrl"
                    fit="contain"
                    ratio="0.9"
                    style="width: 100%; height: auto"
                  />
                </q-avatar>
              </q-item-section>

              <q-item-section class="q-pl-md">
                <q-item-label class="text-h6 text-brown-10">{{ item.product.name }}</q-item-label>
                <q-item-label caption class="text-grey-7">$ {{ item.product.price }}</q-item-label>
                <q-item-label v-if="!item.product.sell" class="text-red text-caption q-mt-xs"
                  >此商品已下架</q-item-label
                >

                <div class="row items-center q-mt-md q-gutter-x-sm">
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
              </q-item-section>

              <q-item-section side class="text-right">
                <div class="text-subtitle1 text-weight-bold text-brown-9">
                  $ {{ (item.product.price * item.quantity).toLocaleString() }}
                </div>
                <q-btn
                  flat
                  round
                  color="grey-4"
                  text-color="grey-7"
                  icon="o_delete"
                  size="sm"
                  class="q-mt-md"
                  @click="updateCart(0, item, i)"
                />
              </q-item-section>
            </q-item>
          </q-list>

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
