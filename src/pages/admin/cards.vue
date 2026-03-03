<template>
  <q-page class="q-pa-md bg-primary">
    <div class="mh-container" style="max-width: 1300px">
      <div class="col-12 q-mb-xl text-center">
        <h1 class="text-h4 text-weight-bolder text-brown-9">卡片管理系統</h1>
      </div>
      <q-separator class="full-width q-my-md" />

      <q-card flat bordered class="shadow-1 text-center">
        <q-table
          flat
          :rows="cards"
          :columns="headers"
          row-key="_id"
          :filter="search"
          :no-data-label="'目前樹洞中沒有任何卡片紀錄'"
          class="admin-card-table"
          v-model:pagination="pagination"
          :grid="$q.screen.lt.md"
        >
          <template #top>
            <div class="row full-width justify-center q-col-gutter-y-sm q-px-md q-py-sm">
              <div class="col-12 col-sm-grow q-px-md">
                <q-input
                  v-model="search"
                  dense
                  outlined
                  placeholder="搜尋卡片名稱..."
                  class="bg-white"
                  color="brown-9"
                >
                  <template #prepend><q-icon name="search" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-auto q-pl-sm-md">
                <q-btn
                  color="brown-9"
                  unelevated
                  label="新增心靈卡片"
                  icon="add"
                  @click="openDialog(null)"
                  class="full-width"
                />
              </div>
            </div>
          </template>

          <template #body-cell-imageUrl="props">
            <q-td :props="props" class="text-center">
              <q-img
                :src="props.row.imageUrl"
                width="60px"
                ratio="0.625"
                class="rounded-borders shadow-1"
              />
            </q-td>
          </template>

          <template #body-cell-moods="props">
            <q-td :props="props" class="text-center">
              <div class="row justify-center q-gutter-xs">
                <q-chip
                  v-for="m in props.row.moods"
                  :key="m._id"
                  size="sm"
                  color="orange-10"
                  text-color="white"
                  class="q-ma-xs text-weight-reguler"
                >
                  # {{ m.name }}
                </q-chip>
              </div>
            </q-td>
          </template>

          <template #body-cell-action="props">
            <q-td :props="props" class="text-center">
              <div class="row justify-center q-gutter-x-sm no-wrap">
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
                  color="red-8"
                  size="sm"
                  @click="deleteCard(props.row._id)"
                />
              </div>
            </q-td>
          </template>

          <template #item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6">
              <q-card flat bordered class="q-qutter-md shadow-1">
                <q-card-section class="row items-center no-wrap q-pa-md">
                  <q-img
                    :src="props.row.imageUrl"
                    width="80px"
                    ratio="0.625"
                    class="rounded-borders shadow-1 flex-shrink-0"
                  />

                  <div class="col text-center">
                    <div class="text-subtitle1 text-weight-bolder text-brown-9 ellipsis q-mb-sm">
                      {{ props.row.name }}
                    </div>

                    <div class="row justify-center q-ma-sm">
                      <q-chip
                        v-for="m in props.row.moods"
                        :key="m._id"
                        size="sm"
                        color="orange-10"
                        text-color="white"
                        class="q-max-sm"
                      >
                        {{ m.name }}
                      </q-chip>
                    </div>

                    <div class="row justify-center q-gutter-x-sm">
                      <q-btn
                        flat
                        round
                        icon="edit"
                        color="blue-7"
                        size="md"
                        @click="openDialog(props.row)"
                      />
                      <q-btn
                        flat
                        round
                        icon="delete"
                        color="red-8"
                        size="md"
                        @click="deleteCard(props.row._id)"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>

          <template v-slot:bottom>
            <div class="row full-width justify-center items-center q-gutter-md q-py-lg">
              <div class="text-brown-9 text-weight-bold">
                {{ (pagination.page - 1) * pagination.rowsPerPage + 1 }}-{{
                  Math.min(pagination.page * pagination.rowsPerPage, cards.length)
                }}
                / 共 {{ cards.length }} 筆
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
                :max="Math.ceil(cards.length / pagination.rowsPerPage) || 1"
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

    <q-dialog v-model="dialog.open" :maximized="$q.screen.lt.sm">
      <q-card style="width: 600px; max-width: 95vw">
        <q-form @submit.prevent="onFormSubmit">
          <q-card-section class="bg-brown-1 text-h6 text-brown-9 text-weight-bold">
            {{ dialog.id ? '編輯心靈卡片' : '新增心靈卡片' }}
          </q-card-section>

          <q-card-section class="q-gutter-md">
            <q-input
              v-model="name.value.value"
              label="卡片名稱"
              outlined
              color="brown-9"
              :error="!!name.errorMessage.value"
              :error-message="name.errorMessage.value"
            />

            <q-expansion-item
              icon="local_offer"
              label="情緒標籤 (1-3個)"
              header-class="bg-grey-2 rounded-borders"
              style="border: 1px solid #ddd; border-radius: 4px"
              class="text-grey-8 q-mt-xs"
            >
              <q-card>
                <q-card-section class="row q-gutter-xs">
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
              v-model="description.value.value"
              label="卡片解讀描述"
              type="textarea"
              color="brown-9"
              outlined
              :error="!!description.errorMessage.value"
              :error-message="description.errorMessage.value"
            />

            <div class="text-caption text-grey-7">卡片圖片 (建議 1:1.6 比例)</div>
            <vue-file-agent
              ref="fileAgent"
              v-model="fileRecords"
              v-model:raw-model-value="rawFileRecords"
              accept="image/*"
              deletable
              help-text="點擊或拖曳上傳圖片"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="取消" color="grey-7" @click="closeDialog" />
            <q-btn
              unelevated
              color="brown-9"
              label="確認儲存"
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
import { ref, useTemplateRef, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import serviceCard from 'src/services/card'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const cards = ref([])
const search = ref('')
const moodsOptions = ref([])
const dialog = ref({ open: false, id: '' })
const fileAgent = useTemplateRef('fileAgent')
const fileRecords = ref([])
const rawFileRecords = ref([])
const pagination = ref({ sortBy: 'name', page: 1, rowsPerPage: 10 })

const headers = [
  { name: 'imageUrl', label: '預覽', align: 'center' },
  { name: 'name', label: '名稱', field: 'name', align: 'center', sortable: true },
  { name: 'moods', label: '標籤', align: 'center' },
  { name: 'action', label: '操作', align: 'center' },
]

const schema = yup.object({
  name: yup.string().required('請輸入名稱'),
  moods: yup.array().min(1, '請至少選一').max(3, '最多三'),
  description: yup.string().required('請輸入描述'),
})

const form = useForm({
  validationSchema: schema,
  initialValues: { name: '', moods: [], description: '' },
})

const name = useField('name'),
  moods = useField('moods'),
  description = useField('description')

const getCards = async () => {
  try {
    const { data } = await serviceCard.getAll()
    cards.value = data.result
  } catch (error) {
    console.error('抓取卡牌失敗:', error)

    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: '無法取得卡牌資料，請檢查網路連線',
      position: 'top',
    })
  }
}
const getMoodsOptions = async () => {
  try {
    const { data } = await api.get('/mood')
    moodsOptions.value = data.result.map((m) => ({ label: m.name, value: m._id }))
  } catch (error) {
    console.error('抓取情緒標籤失敗:', error)
    $q.notify({
      color: 'red',
      message: '情緒標籤讀取失敗，可能影響日記儲存',
      icon: 'report_problem',
    })
  }
}

const toggleMood = (id) => {
  const current = [...(moods.value.value || [])],
    idx = current.indexOf(id)
  if (idx > -1) current.splice(idx, 1)
  else if (current.length < 3) current.push(id)
  moods.value.value = current
}

const openDialog = (item) => {
  if (item) {
    dialog.value.id = item._id
    name.value.value = item.name
    description.value.value = item.description
    moods.value.value = item.moods?.map((m) => m._id || m) || []
    fileRecords.value = item.imageUrl ? [{ url: item.imageUrl, name: item.name }] : []
  } else {
    dialog.value.id = ''
    form.resetForm()
    fileRecords.value = []
  }
  dialog.value.open = true
}

const closeDialog = () => {
  dialog.value.open = false
  form.resetForm()
  fileAgent.value?.deleteFileRecord()
}

const onFormSubmit = form.handleSubmit(
  async (values) => {
    if (!dialog.value.id && fileRecords.value.length === 0)
      return $q.notify({ color: 'red', message: '請上傳圖片', icon: 'warning' })

    const fd = new FormData()
    fd.append('name', values.name)
    fd.append('description', values.description)
    values.moods.forEach((id) => fd.append('moods', id))

    if (fileRecords.value[0]?.file) {
      fd.append('image', fileRecords.value[0].file)
    }

    try {
      const action = dialog.value.id
        ? serviceCard.update(dialog.value.id, fd)
        : serviceCard.create(fd)
      await action
      $q.notify({ color: 'green', message: '操作成功', icon: 'check' })
      closeDialog()
      getCards()
    } catch (error) {
      console.log(error)
      $q.notify({ color: 'red', message: error.response?.data?.message || '儲存失敗' })
    }
  },
  (errors) => {
    const firstErr = Object.values(errors)[0]
    $q.notify({ color: 'orange-9', message: `請填寫完整：${firstErr}`, position: 'top' })
  },
)

const deleteCard = (id) => {
  $q.dialog({
    title: '確認',
    message: '刪除這張卡片？',
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
      await serviceCard.remove(id)
      getCards()
    } catch (error) {
      console.error('刪除失敗:', error)
      $q.notify({ color: 'red', message: '刪除失敗' })
    }
  })
}

onMounted(() => {
  getCards()
  getMoodsOptions()
})
</script>

<style lang="scss" scoped></style>

<route lang="yaml">
meta:
  layout: AdminLayout
  title: '卡片管理'
  admin: true
</route>
