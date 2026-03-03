<template>
  <q-page class="q-pa-md bg-primary">
    <div class="mh-container" style="max-width: 1300px">
      <div class="col-12 q-mb-xl">
        <h1 class="text-h4 text-center text-weight-bolder text-brown-9">商品管理系統</h1>
      </div>
      <q-separator class="full-width q-my-md" />

      <q-card flat bordered class="shadow-1">
        <q-table
          flat
          :rows="products"
          :columns="headers"
          row-key="_id"
          :filter="search"
          :no-data-label="'目前樹洞中沒有任何商品紀錄'"
          class="admin-product-table"
          v-model:pagination="pagination"
          :rows-per-page-options="[6, 12, 24, 0]"
          :grid="$q.screen.lt.md"
        >
          <template #top>
            <div class="row full-width justify-center q-col-gutter-y-sm q-px-md q-py-sm">
              <div class="col-12 col-sm-grow q-px-md">
                <q-input
                  v-model="search"
                  dense
                  outlined
                  placeholder="搜尋商品名稱..."
                  color="brown-9"
                  class="bg-white"
                >
                  <template #prepend><q-icon name="search" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-auto q-pl-sm-md">
                <q-btn
                  color="brown-9"
                  unelevated
                  label="新增商品"
                  icon="add"
                  @click="openDialog(null)"
                  class="full-width mh-btn-action"
                />
              </div>
            </div>
          </template>

          <template #body-cell-imageUrl="props">
            <q-td :props="props">
              <q-img
                :src="props.row.imageUrl"
                width="60px"
                ratio="0.625"
                class="rounded-borders shadow-1 cursor-pointer"
                @click="goToProduct(props.row._id)"
              />
            </q-td>
          </template>

          <template #body-cell-name="props">
            <q-td :props="props">
              <span
                class="cursor-pointer text-brown-9 text-weight-bold"
                @click="goToProduct(props.row._id)"
              >
                {{ props.row.name }}
              </span>
            </q-td>
          </template>

          <template #body-cell-moods="props">
            <q-td :props="props">
              <div class="row q-gutter-xs justify-center">
                <q-chip
                  v-for="m in props.row.moods"
                  :key="m._id"
                  size="sm"
                  color="orange-10"
                  text-color="white"
                  class="q-ma-xs"
                >
                  {{ m.name }}
                </q-chip>
              </div>
            </q-td>
          </template>

          <template #body-cell-price="props">
            <q-td :props="props" class="text-weight-bolder text-brown-10">
              {{ formatCurrency(props.value) }}
            </q-td>
          </template>

          <template #body-cell-sell="props">
            <q-td :props="props">
              <q-chip
                size="sm"
                :color="props.value ? 'green-1' : 'red-1'"
                :text-color="props.value ? 'green-9' : 'red-8'"
                class="text-bold"
              >
                {{ props.value ? '販售中' : '已下架' }}
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-action="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn flat round icon="edit" color="blue-7" @click="openDialog(props.row)">
                <q-tooltip>編輯商品</q-tooltip>
              </q-btn>
              <q-btn flat round icon="delete" color="red-7" @click="deleteProduct(props.row._id)">
                <q-tooltip>移除商品</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #item="props">
            <div class="q-pa-xs col-xs-12 col-md-4">
              <q-card flat bordered class="q-mb-sm shadow-1">
                <q-card-section class="row items-center no-wrap q-pa-sm">
                  <q-img
                    :src="props.row.imageUrl"
                    width="80px"
                    ratio="0.625"
                    fit="contain"
                    class="rounded-borders shadow-1 flex-shrink-0 q-mr-md cursor-pointer"
                    @click="goToProduct(props.row._id)"
                  />
                  <div class="col text-center">
                    <div class="row justify-center items-center no-wrap q-gutter-sm">
                      <div
                        class="text-subtitle1 text-weight-bolder text-brown-9 ellipsis cursor-pointer"
                        @click="goToProduct(props.row._id)"
                      >
                        {{ props.row.name }}
                        <q-tooltip>{{ props.row.name }}</q-tooltip>
                      </div>
                      <div>
                        <q-chip
                          size="sm"
                          :color="props.row.sell ? 'green-1' : 'red-1'"
                          :text-color="props.row.sell ? 'green-9' : 'red-8'"
                          class="q-ma-none"
                        >
                          {{ props.row.sell ? '販售中' : '已下架' }}
                        </q-chip>
                      </div>
                    </div>

                    <div class="text-caption text-grey-7 q-mb-xs">
                      {{ props.row.author }}
                    </div>
                    <div class="text-caption text-grey-7 q-mb-xs">
                      {{ props.row.publisher }}
                    </div>

                    <div class="text-caption text-grey-7 q-mb-xs">
                      上架日: {{ new Date(props.row.createdAt).toLocaleDateString() }}
                    </div>

                    <div class="text-subtitle2 text-brown-9 text-weight-bold">
                      {{ formatCurrency(props.row.price) }}
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions class="q-pa-sm">
                  <div class="row full-width items-center">
                    <div class="col"></div>
                    <div class="col-auto">
                      <div class="row q-gutter-xs justify-center">
                        <q-chip
                          v-for="m in props.row.moods"
                          :key="m._id"
                          size="sm"
                          color="orange-10"
                          text-color="white"
                          class="q-mx-sm"
                        >
                          {{ m.name }}
                        </q-chip>
                      </div>
                    </div>
                    <div class="col text-right">
                      <div class="row q-gutter-xs justify-end">
                        <q-btn
                          flat
                          round
                          icon="edit"
                          color="blue-7"
                          size="sm"
                          @click="openDialog(props.row)"
                        />
                        <q-btn
                          flat
                          round
                          icon="delete"
                          color="red-7"
                          size="sm"
                          @click="deleteProduct(props.row._id)"
                        />
                      </div>
                    </div>
                  </div>
                </q-card-actions>
              </q-card>
            </div>
          </template>
          <template v-slot:pagination="scope">
            <div v-if="$q.screen.lt.md" class="row full-width justify-center items-center q-py-md">
              <q-btn
                icon="chevron_left"
                color="brown-9"
                round
                flat
                dense
                :disable="scope.isFirstPage"
                @click="scope.prevPage"
              />

              <div class="text-caption q-px-md text-brown-9 text-weight-bold">
                {{ scope.pagination.page }} / {{ scope.pagesNumber }}
              </div>

              <q-btn
                icon="chevron_right"
                color="brown-9"
                round
                flat
                dense
                :disable="scope.isLastPage"
                @click="scope.nextPage"
              />
            </div>

            <div v-else class="row items-center">
              <div class="text-caption q-mr-sm">每頁顯示:</div>
              <q-select
                v-model="pagination.rowsPerPage"
                :options="[6, 12, 24, 0]"
                dense
                flat
                borderless
                options-dense
                class="q-mr-xl"
                style="min-width: 60px"
              />

              <q-btn
                icon="first_page"
                color="grey-8"
                round
                flat
                dense
                :disable="scope.isFirstPage"
                @click="scope.firstPage"
              />
              <q-btn
                icon="chevron_left"
                color="grey-8"
                round
                flat
                dense
                :disable="scope.isFirstPage"
                @click="scope.prevPage"
              />

              <div class="q-px-sm text-caption text-weight-bold">
                {{ scope.pagination.page }} / {{ scope.pagesNumber }}
              </div>

              <q-btn
                icon="chevron_right"
                color="grey-8"
                round
                flat
                dense
                :disable="scope.isLastPage"
                @click="scope.nextPage"
              />
              <q-btn
                icon="last_page"
                color="grey-8"
                round
                flat
                dense
                :disable="scope.isLastPage"
                @click="scope.lastPage"
              />
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-dialog v-model="dialog.open">
      <q-card style="width: 600px; max-width: 95vw">
        <q-form @submit.prevent="submit">
          <q-card-section class="bg-brown-1">
            <div class="text-h6 text-brown-9 text-weight-bold">
              {{ dialog.id ? '修改商品資訊' : '新增樹洞商品' }}
            </div>
          </q-card-section>

          <q-card-section class="q-gutter-xs">
            <q-input
              v-model="name.value.value"
              label="商品名稱"
              color="brown-9"
              outlined
              :error="!!name.errorMessage.value"
              :error-message="name.errorMessage.value"
            />
            <q-input
              v-model="author.value.value"
              label="作者"
              color="brown-9"
              outlined
              :error="!!author.errorMessage.value"
              :error-message="author.errorMessage.value"
            />
            <q-input
              v-model="publisher.value.value"
              label="出版社"
              color="brown-9"
              outlined
              :error="!!publisher.errorMessage.value"
              :error-message="publisher.errorMessage.value"
            />
            <q-input
              v-model="price.value.value"
              label="商品價格"
              color="brown-9"
              type="number"
              outlined
              :error="!!price.errorMessage.value"
              :error-message="price.errorMessage.value"
            />

            <q-expansion-item
              icon="local_offer"
              label="情緒標籤 (1-3個)"
              header-class="bg-grey-2 rounded-borders"
              style="border: 1px solid #ddd; border-radius: 4px"
              class="text-grey-8 q-mt-xs"
            >
              <q-card>
                <q-card-section class="row q-gutter-sm">
                  <q-chip
                    v-for="opt in moodsOptions"
                    :key="opt.value"
                    clickable
                    @click="toggleMood(opt.value)"
                    :color="moods.value.value?.includes(opt.value) ? 'brown-9' : 'grey-4'"
                    :text-color="moods.value.value?.includes(opt.value) ? 'white' : 'brown-9'"
                    >{{ opt.label }}</q-chip
                  >
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <div class="row q-gutter-xs" v-if="moods.value.value?.length > 0">
              <q-chip
                v-for="val in moods.value.value"
                :key="val"
                size="sm"
                removable
                @remove="toggleMood(val)"
                color="brown-9"
                text-color="white"
                class="q-p-md text-weight-regular"
              >
                {{ moodsOptions.find((o) => o.value === val)?.label }}
              </q-chip>
            </div>

            <q-input
              v-model="quote.value.value"
              label="簡介"
              color="brown-9"
              type="textarea"
              outlined
            />
            <q-input
              v-model="description.value.value"
              label="商品詳細說明"
              color="brown-9"
              type="textarea"
              outlined
            />

            <div class="text-caption text-grey-7">商品圖片 (建議 1:1 比例)</div>
            <vue-file-agent
              ref="fileAgent"
              v-model="fileRecords"
              v-model:raw-model-value="rawFileRecords"
              accept="image/png,image/jpg,image/jpeg"
              deletable
              :max-files="1"
              max-size="1MB"
              help-text="點擊或拖曳商品圖片"
            />

            <q-checkbox
              v-model="sell.value.value"
              label="立即上架此商品"
              color="brown-5"
              class="text-brown-9"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="取消" color="grey-7" @click="closeDialog" />
            <q-btn
              unelevated
              color="brown-9"
              :label="dialog.id ? '儲存修改' : '確認新增'"
              type="submit"
              :loading="form.isSubmitting.value"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useField, useForm } from 'vee-validate'
import { ref, useTemplateRef, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import * as yup from 'yup'
import serviceProduct from 'src/services/product'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const router = useRouter()
const products = ref([])
const search = ref('')
const fileAgent = useTemplateRef('fileAgent')
const fileRecords = ref([])
const rawFileRecords = ref([])
const moodsOptions = ref([])
const dialog = ref({ open: false, id: '' })
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 6,
})

const headers = [
  {
    name: 'imageUrl',
    label: '圖片',
    align: 'center',
    headerStyle: 'width: 100px',
    style: 'width: 100px',
  },
  {
    name: 'name',
    label: '名稱',
    field: 'name',
    align: 'center',
    sortable: true,
    headerStyle: 'min-width: 180px; max-width: 250px',
    style: 'min-width: 180px; max-width: 250px; white-space: normal;',
  },
  {
    name: 'author',
    label: '作者',
    field: 'author',
    align: 'center',
    sortable: true,
    headerStyle: 'min-width: 100px',
    style: 'min-width: 100px',
  },
  {
    name: 'publisher',
    label: '出版社',
    field: 'publisher',
    align: 'center',
    sortable: true,
    headerStyle: 'min-width: 100px',
    style: 'min-width: 100px',
  },
  {
    name: 'moods',
    label: '分類標籤',
    align: 'center',
    headerStyle: 'min-width: 180px; max-width: 280px',
    style: 'min-width: 180px; max-width: 280px; white-space: normal;',
  },
  {
    name: 'price',
    label: '價格',
    field: 'price',
    align: 'center',
    sortable: true,
    headerStyle: 'width: 100px',
    style: 'width: 100px',
  },
  {
    name: 'sell',
    label: '狀態',
    field: 'sell',
    align: 'center',
    headerStyle: 'width: 100px',
    style: 'width: 100px',
  },
  {
    name: 'createdAt',
    label: '上架時間',
    field: 'createdAt',
    align: 'center',
    sortable: true,
    headerStyle: 'width: 120px',
    style: 'width: 120px',
    format: (val) => (val ? new Date(val).toLocaleDateString() : '無資料'),
  },
  {
    name: 'action',
    label: '操作',
    align: 'center',
    headerStyle: 'width: 120px',
    style: 'width: 120px',
  },
]

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
  }).format(value)
}

const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

const getProducts = async () => {
  try {
    const { data } = await serviceProduct.getAll()
    products.value = data.result
  } catch {
    $q.notify({ color: 'red', message: '讀取列表失敗' })
  }
}

const getMoodsOptions = async () => {
  try {
    const { data } = await api.get('/mood')
    moodsOptions.value = data.result.map((m) => ({ label: m.name, value: m._id }))
    moodsOptions.value.sort((a, b) => a.label.localeCompare(b.label, 'zh-TW'))
  } catch {
    $q.notify({ color: 'red', message: '取得標籤失敗' })
  }
}

const toggleMood = (id) => {
  const current = Array.isArray(moods.value.value) ? [...moods.value.value] : []
  const index = current.indexOf(id)
  if (index > -1) {
    current.splice(index, 1)
  } else {
    if (current.length < 3) {
      current.push(id)
    } else {
      $q.notify({ color: 'orange-9', message: '標籤選擇已達上限 (最多3個)', icon: 'warning' })
    }
  }
  moods.value.value = current
}

const openDialog = (item) => {
  if (item) {
    dialog.value.id = item._id
    name.value.value = item.name
    price.value.value = item.price
    quote.value.value = item.quote || ''
    description.value.value = item.description || ''
    author.value.value = item.author || ''
    publisher.value.value = item.publisher || ''
    moods.value.value = item.moods?.map((m) => m._id || m) || []
    sell.value.value = item.sell
    if (item.imageUrl)
      fileRecords.value = [{ url: item.imageUrl, name: item.name, type: 'image/*' }]
  } else {
    dialog.value.id = ''
    form.resetForm()
    fileRecords.value = []
    moods.value.value = []
  }
  dialog.value.open = true
}

const closeDialog = () => {
  dialog.value.open = false
  dialog.value.id = ''
  form.resetForm()
  fileAgent.value?.deleteFileRecord()
}

const schema = yup.object({
  name: yup.string().required('請輸入商品名稱').max(100),
  price: yup.number().typeError('請輸入數字').required('請輸入商品價格').min(0),
  author: yup.string().required('請輸入作者名稱'),
  publisher: yup.string().required('請輸入出版社'),
  moods: yup.array().of(yup.string()).min(1, '至少選擇一個標籤').max(3, '最多選擇 3 個標籤'),
  sell: yup.boolean().required(),
})

const form = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    price: 0,
    author: '',
    publisher: '',
    quote: '',
    description: '',
    moods: [],
    sell: true,
  },
})

const name = useField('name')
const price = useField('price')
const moods = useField('moods')
const description = useField('description')
const sell = useField('sell')
const author = useField('author')
const publisher = useField('publisher')
const quote = useField('quote')

const submit = form.handleSubmit(async (values) => {
  if (!dialog.value.id && fileRecords.value.length === 0) {
    $q.notify({ color: 'red', message: '請上傳商品圖片' })
    return
  }
  const fd = new FormData()
  fd.append('name', values.name)
  fd.append('price', values.price)
  fd.append('quote', values.quote || '')
  fd.append('description', values.description || '')
  fd.append('author', values.author)
  fd.append('publisher', values.publisher)
  fd.append('sell', values.sell)
  values.moods.forEach((id) => fd.append('moods', id))
  if (fileRecords.value[0]?.file) fd.append('image', fileRecords.value[0].file)

  try {
    await (dialog.value.id ? serviceProduct.update(dialog.value.id, fd) : serviceProduct.create(fd))
    $q.notify({ color: 'green', message: '操作成功', icon: 'check' })
    closeDialog()
    getProducts()
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'red', message: error?.response?.data?.message || '發生錯誤' })
  }
})

const deleteProduct = async (id) => {
  $q.dialog({
    title: '刪除確認',
    message: '確定要將此商品從樹洞中移除嗎？',
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
      await serviceProduct.remove(id)
      $q.notify({ color: 'brown-9', message: '商品已成功移除', icon: 'done' })
      getProducts()
    } catch {
      $q.notify({ color: 'red', message: '刪除失敗' })
    }
  })
}

onMounted(() => {
  getProducts()
  getMoodsOptions()
})
</script>

<style lang="scss" scoped></style>

<route lang="yaml">
meta:
  layout: AdminLayout
  title: '商品管理'
  login: login-only
  admin: true
</route>
