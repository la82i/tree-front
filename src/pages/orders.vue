<template>
  <q-page class="q-pa-xl bg-primary">
    <div class="mh-container">
      <div class="text-h4 text-brown-9 q-mb-lg text-center">訂單紀錄</div>

      <q-card flat bordered class="rounded-card shadow-1">
        <q-table
          flat
          :rows="orders"
          :columns="headers"
          row-key="_id"
          :no-data-label="'目前沒有任何訂單紀錄'"
        >
          <template #body-cell-cart="props">
            <q-td :props="props">
              <q-list dense>
                <q-item
                  v-for="item in props.value"
                  :key="item._id"
                  class="q-pa-none"
                  style="min-height: 20px"
                >
                  <q-item-section class="text-grey-8">
                    {{ item.product.name }}
                    <span class="text-grey-8 q-ml-xs">x {{ item.quantity }}</span>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-td>
          </template>

          <template #body-cell-totalPrice="props">
            <q-td :props="props" class="text-weight-bolder text-brown-10">
              $ {{ props.value.toLocaleString() }}
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import serviceOrder from 'src/services/order'

const $q = useQuasar()
const orders = ref([])

const headers = [
  {
    name: '_id',
    label: '訂單編號',
    align: 'left',
    field: '_id',
  },
  {
    name: 'createdAt',
    label: '訂購日期',
    align: 'left',
    field: 'createdAt',
    sortable: true,
    format: (val) => new Date(val).toLocaleString(),
  },
  {
    name: 'cart',
    label: '商品內容',
    align: 'left',
    field: 'cart',
  },
  {
    name: 'totalPrice',
    label: '總金額',
    align: 'right',
    field: (row) => row.cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
  },
]

const getOrders = async () => {
  try {
    const { data } = await serviceOrder.get()
    orders.value = data.result
  } catch (error) {
    console.log(error)
    $q.notify({
      color: 'red-7',
      icon: 'error',
      message: '讀取訂單失敗，請稍後再試',
    })
  }
}

onMounted(getOrders)
</script>

<style lang="scss" scoped>
.rounded-card {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.q-table th) {
  font-weight: 700;
  color: #5d4037;
  background-color: #efebe9;
}
</style>

<route lang="yaml">
meta:
  title: 訂單
  login: login-only
</route>
