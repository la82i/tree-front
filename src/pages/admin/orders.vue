<template>
  <q-page class="q-pa-md bg-primary">
    <div class="mh-container" style="max-width: 1300px">
      <div class="col-12 col-md-8 q-mb-xl">
        <h1 class="text-h4 text-center text-weight-bolder text-brown-9">訂單管理系統</h1>
      </div>
      <q-separator class="full-width q-my-md" />

      <q-card flat bordered class="shadow-1">
        <q-table
          flat
          :rows="orders"
          :columns="headers"
          row-key="_id"
          :filter="search"
          :no-data-label="'目前樹洞中沒有任何訂單紀錄'"
          v-model:pagination="pagination"
          :rows-per-page-options="[5, 10, 20, 50, 0]"
          :grid="$q.screen.lt.md"
        >
          <template #top>
            <div class="row full-width justify-center q-col-gutter-y-sm q-px-md q-py-sm">
              <div class="col-12">
                <q-input
                  v-model="search"
                  dense
                  outlined
                  color="brown-9"
                  placeholder="搜尋訂單 ID 或 帳號"
                  class="bg-white"
                >
                  <template #prepend><q-icon name="search" /></template>
                </q-input>
              </div>
            </div>
          </template>

          <template #body-cell-cart="props">
            <q-td :props="props">
              <div class="q-py-sm">
                <div v-for="item in props.value" :key="item._id" class="text-brown-9 q-mb-xs">
                  <span class="text-weight-medium q-mr-sm">{{ item.product.name }} </span>
                  <q-badge color="brown-6" text-color="brown-6" outline>
                    {{ item.quantity }}
                  </q-badge>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-totalPrice="props">
            <q-td :props="props" class="text-weight-bolder text-brown-10 text-subtitle2">
              {{ formatCurrency(props.value) }}
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props" class="text-center">
              <q-chip size="sm" color="green-1" text-color="green-9" class="text-bold">
                已完成
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-action="props">
            <q-td :props="props" class="text-center">
              <q-btn
                flat
                round
                icon="delete"
                color="red-8"
                size="sm"
                @click="deleteOrder(props.row._id)"
              >
                <q-tooltip>刪除訂單</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
              <q-card flat bordered class="q-mb-sm shadow-1">
                <q-card-section class="q-pa-sm">
                  <div class="row items-center justify-between">
                    <div class="text-subtitle2 text-weight-bold text-brown-9">
                      {{ props.row.user.account }}
                    </div>
                    <div class="text-caption text-brown-9">
                      {{ new Date(props.row.createdAt).toLocaleDateString() }}
                    </div>
                  </div>
                  <div class="text-caption text-grey-7">ID: {{ props.row._id }}</div>
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pa-sm">
                  <div
                    v-for="item in props.row.cart"
                    :key="item._id"
                    class="row justify-between items-center q-m-xs"
                  >
                    <div class="text-grey-7 ellipsis col-8">{{ item.product.name }}</div>
                    <div class="text-grey-7">
                      x{{ item.quantity }}
                      <span class="text-subtitle1 text-weight-bolder text-brown-10 q-mx-md">
                        {{
                          formatCurrency(
                            props.row.cart.reduce(
                              (total, item) => total + item.product.price * item.quantity,
                              0,
                            ),
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </q-card-section>

                <q-card-section class="q-pa-sm row items-center justify-between">
                  <q-chip
                    size="sm"
                    color="green-1"
                    text-color="green-9"
                    class="text-bold q-ma-none"
                  >
                    已完成
                  </q-chip>

                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="red-8"
                    @click="deleteOrder(props.row._id)"
                  />
                </q-card-section>
              </q-card>
            </div>
          </template>
          <template v-slot:bottom>
            <div class="row full-width justify-center items-center q-gutter-md q-py-lg">
              <div class="text-brown-9 text-weight-bold">
                {{ (pagination.page - 1) * pagination.rowsPerPage + 1 }}-{{
                  Math.min(pagination.page * pagination.rowsPerPage, orders.length)
                }}
                / 共 {{ orders.length }} 筆
              </div>

              <div class="row items-center">
                <span class="text-grey-7 q-mr-sm">每頁顯示：</span>
                <q-select
                  v-model="pagination.rowsPerPage"
                  :options="[5, 10, 20, 50]"
                  dense
                  outlined
                  rounded
                  options-dense
                  style="width: 85px"
                  bg-color="white"
                  color="brown-9"
                  popup-content-class="bg-primary text-brown-9"
                  options-selected-class="bg-brown-9 text-white text-bold"
                />
              </div>

              <q-pagination
                v-model="pagination.page"
                :max="Math.ceil(orders.length / pagination.rowsPerPage) || 1"
                :max-pages="6"
                color="brown-9"
                direction-links
                flat
                active-design="push"
                active-color="brown-2"
                active-text-color="brown-10"
              />
            </div>
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
const search = ref('')
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(value)
}

const headers = [
  { name: '_id', label: '訂單編號', align: 'center', field: '_id', classes: 'text-grey-7' },
  { name: 'user', label: '訂購用戶', align: 'center', field: (row) => row.user.account },
  {
    name: 'createdAt',
    label: '成立日期',
    align: 'center',
    field: 'createdAt',
    format: (val) => (val ? new Date(val).toLocaleString('zh-TW') : ''),
  },
  { name: 'cart', label: '商品明細', align: 'center', field: 'cart' },
  {
    name: 'totalPrice',
    label: '結帳金額',
    align: 'center',
    field: (row) => row.cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
  },
  { name: 'status', label: '狀態', align: 'center' },
  { name: 'action', label: '操作', align: 'center' },
]

const getOrders = async () => {
  try {
    const { data } = await serviceOrder.getAll()
    orders.value = data.result
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'red-8', icon: 'error', message: '無法取得訂單資料' })
  }
}

const deleteOrder = async (id) => {
  $q.dialog({
    title: '刪除確認',
    message: '確定要刪除這筆訂單紀錄嗎？',
    cancel: {
      flat: true,
      color: 'grey-7',
      label: '取消',
    },
    ok: {
      flat: true,
      color: 'red-8',
      label: '確定刪除',
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await serviceOrder.remove(id)
      $q.notify({ color: 'green', message: '訂單已刪除', icon: 'check' })
      getOrders()
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'red-8', message: '刪除失敗' })
    }
  })
}

onMounted(getOrders)
</script>

<style lang="scss" scoped>
td {
  font-size: 14px;
}
</style>

<route lang="yaml">
meta:
  layout: AdminLayout
  title: 訂單管理
  login: login-only
  admin: true
</route>
