<template>
  <q-page class="q-pa-md bg-primary">
    <div class="mh-container" style="max-width: 1300px">
      <div class="col-12 col-md-8 q-mb-xl">
        <h1 class="text-h4 text-center text-weight-bolder text-brown-9 q-mb-md">情緒標籤管理</h1>
      </div>
      <q-separator class="full-width q-my-md" />

      <q-card flat bordered class="shadow-1">
        <q-table
          :rows="moods"
          :columns="headers"
          row-key="_id"
          :filter="search"
          flat
          :no-data-label="'目前還沒有建立任何情緒標籤'"
          v-model:pagination="pagination"
          :rows-per-page-options="[5, 10, 20, 50, 0]"
          :grid="$q.screen.lt.md"
        >
          <template #top>
            <div class="row full-width justify-center q-col-gutter-y-sm q-pa-sm">
              <div class="col-12 col-sm-grow">
                <q-input
                  v-model="search"
                  color="brown-9"
                  dense
                  outlined
                  placeholder="搜尋標籤..."
                  class="col-12 col-sm-grow q-px-md bg-white"
                >
                  <template #prepend><q-icon name="search" /></template>
                </q-input>
              </div>
              <div class="col-12 col-sm-auto q-pl-sm-md">
                <q-btn
                  color="brown-9"
                  label="新增標籤"
                  icon="add"
                  @click="openDialog"
                  class="full-width"
                />
              </div>
            </div>
          </template>

          <template #body-cell-action="props">
            <q-td :props="props" class="text-center" style="width: 100px">
              <q-btn
                flat
                round
                icon="delete"
                color="red-8"
                size="sm"
                @click="deleteMood(props.row._id, props.row.name)"
              >
                <q-tooltip>刪除此標籤</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #item="props">
            <div class="col-xs-6 col-md-4 q-pa-sm">
              <q-card flat bordered class="shadow-1">
                <q-card-section class="row items-center justify-center q-pa-xs">
                  <div class="text-subtitle2 text-weight-bold text-brown-9">
                    {{ props.row.name }}
                  </div>
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="red-8"
                    @click="deleteMood(props.row._id, props.row.name)"
                    size="sm"
                  />
                </q-card-section>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-dialog v-model="dialog">
      <q-card style="width: 400px; max-width: 90vw">
        <q-form @submit.prevent="submit">
          <q-card-section class="bg-brown-1">
            <div class="text-h6 text-brown-9">新增情緒標籤</div>
          </q-card-section>

          <q-card-section class="q-pa-lg">
            <q-input
              v-model="name.value.value"
              label="標籤名稱 (例如：憂鬱、平靜)"
              outlined
              autofocus
              :error="!!name.errorMessage.value"
              :error-message="name.errorMessage.value"
              color="brown-9"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-pr-md">
            <q-btn flat label="取消" color="grey-7" @click="closeDialog" />
            <q-btn
              unelevated
              color="brown-9"
              label="確認新增"
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import { api } from 'src/boot/axios'
import serviceMood from 'src/services/mood'

const $q = useQuasar()
const moods = ref([])
const search = ref('')
const dialog = ref(false)
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 6,
})

const headers = [
  { name: 'name', label: '標籤名稱', field: 'name', align: 'center', sortable: true },
  { name: 'action', label: '操作', align: 'center' },
]

const getMoods = async () => {
  try {
    const { data } = await api.get('/mood')
    moods.value = data.result
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'red', message: '標籤讀取失敗' })
  }
}

const schema = yup.object({
  name: yup.string().required('標籤名稱不能空白').min(1, '最少 1 個字'),
})

const form = useForm({
  validationSchema: schema,
  initialValues: { name: '' },
})

const name = useField('name')

const openDialog = () => {
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  form.resetForm()
}

// --- 新增情緒 ---
const submit = form.handleSubmit(async (values) => {
  try {
    await serviceMood.create(values)

    $q.notify({ color: 'green', message: `標籤「${values.name}」已新增`, icon: 'check' })
    closeDialog()
    getMoods()
  } catch (error) {
    console.log(error)
    const message = error.response?.data?.message || '新增失敗'
    $q.notify({ color: 'red', message })
  }
})

const deleteMood = (id, moodName) => {
  $q.dialog({
    title: '刪除標籤',
    message: `確定要將情緒標籤 <b class="text-brown-9">「${moodName}」</b> 移除嗎？`,
    html: true,
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
      await serviceMood.remove(id)
      getMoods()
      $q.notify({
        color: 'brown-9',
        icon: 'check',
        message: `標籤「${moodName}」已成功移除`,
        position: 'top',
      })
    } catch (error) {
      console.log(error)
      const errorMsg = error.response?.data?.message || '刪除失敗，請稍後再試'
      $q.notify({
        color: 'red-8',
        icon: 'warning',
        message: errorMsg,
      })
    }
  })
}

onMounted(getMoods)
</script>

<style lang="scss" scoped></style>

<route lang="yaml">
meta:
  layout: AdminLayout
  title: 情緒標籤管理
  login: login-only
  admin: true
</route>
