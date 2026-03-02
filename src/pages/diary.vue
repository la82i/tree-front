<template>
  <q-page class="q-pa-xl bg-primary">
    <div class="mh-container">
      <div class="text-h4 text-brown-9 q-mb-lg text-center">樹洞日記</div>

      <div v-if="diaries.length === 0" class="column items-center q-pt-xl text-grey-6">
        <q-icon name="o_auto_stories" size="100px" />
        <div class="text-h6 q-mt-md">還沒有任何紀錄，去抽張牌吧</div>
        <q-btn flat label="前往抽卡" color="brown" to="/" class="q-mt-md" />
      </div>

      <div v-else class="row q-col-gutter-xl q-mt-md">
        <div v-for="item in pagedDiaries" :key="item._id" class="col-12 col-md-12">
          <q-card class="my-diary-card shadow-3 relative-position mh-card-shadow">
            <q-card-section class="row items-center justify-between">
              <div class="row items-center q-gutter-md q-mx-md">
                <div class="text-subtitle2 text-grey-8">
                  {{ new Date(item.createdAt).toLocaleDateString() }}
                </div>

                <div class="row q-gutter-xs">
                  <q-chip
                    v-for="mood in item.moods || []"
                    :key="mood._id"
                    size="sm"
                    color="brown-2"
                    text-color="brown-9"
                  >
                    # {{ mood.name }}
                  </q-chip>
                </div>
              </div>

              <q-btn
                flat
                round
                dense
                icon="o_delete"
                color="brown-9"
                size="md"
                class="absolute-top-right q-ma-sm z-max"
                @click="confirmDelete(item._id)"
              />
            </q-card-section>

            <q-separator inset />

            <q-card-section class="row q-col-gutter-sm">
              <div class="col-3">
                <q-img
                  :src="item.card?.imageUrl || ''"
                  fit="contain"
                  style="width: 100%; height: 200px"
                  class="rounded-borders"
                >
                  <template v-slot:error>
                    <div
                      class="absolute-full flex flex-center bg-grey-3 text-grey-8"
                      style="font-size: 10px"
                    >
                      卡片已移除
                    </div>
                  </template>
                </q-img>
                <div class="text-caption text-center q-mt-xs">
                  {{ item.card?.name || '未知卡片' }}
                </div>
              </div>
              <div class="col-9">
                <div class="diary-content text-body1 text-brown-8 q-pr-md mh-hide-scrollbar">
                  " {{ item.content }} "
                </div>
              </div>
            </q-card-section>

            <q-expansion-item
              label="當時的樹洞回響 (推薦書單)"
              header-class="text-brown-7 text-center"
              dense
              class="bg-primary rounded-borders"
            >
              <q-card-section class="q-pa-xs flex flex-center">
                <div
                  v-if="item.recommendedProducts && item.recommendedProducts.length > 0"
                  class="mini-book-tab column items-center q-pa-sm cursor-pointer"
                  style="width: 140px; border-radius: 8px"
                  @click="router.push('/product/' + item.recommendedProducts[0]._id)"
                >
                  <q-img
                    :src="item.recommendedProducts[0]?.imageUrl || ''"
                    fit="contain"
                    style="width: 110px; height: 140px"
                    class="rounded-borders q-mb-sm"
                  />
                  <div class="text-caption text-brown-9 text-center full-width ellipsis">
                    {{ item.recommendedProducts[0]?.name || '無標題' }}
                  </div>
                  <div class="text-caption text-brown-9 text-bold">
                    ${{ item.recommendedProducts[0]?.price }}
                  </div>
                </div>
                <div v-else class="text-grey-6 text-caption">當時沒有適合的推薦</div>
              </q-card-section>
            </q-expansion-item>
          </q-card>
        </div>

        <div class="col-12 row justify-center items-center q-gutter-md q-mt-xl q-pb-lg">
          <div class="row items-center">
            <span class="text-grey-7 q-mr-sm">每頁顯示：</span>
            <q-select
              v-model="pagination.rowsPerPage"
              :options="[5, 10, 15, 20]"
              dense
              outlined
              rounded
              options-dense
              style="width: 85px"
              bg-color="white"
              color="brown-9"
              popup-content-class="bg-primary text-brown-9"
              @update:model-value="pagination.page = 1"
            />
          </div>

          <q-pagination
            v-model="pagination.page"
            :max="maxPages"
            :max-pages="6"
            color="brown-9"
            direction-links
            flat
            active-design="push"
            active-color="brown-2"
            active-text-color="brown-10"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import serviceDiary from 'src/services/diary'

const $q = useQuasar()
const router = useRouter()
const diaries = ref([])
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
})

const fetchDiaries = async () => {
  try {
    const { data } = await serviceDiary.getMyHistory()
    diaries.value = data.result
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'red', message: '讀取紀錄失敗，請稍後再試' })
  }
}

const maxPages = computed(() => {
  return Math.ceil(diaries.value.length / pagination.value.rowsPerPage) || 1
})

const pagedDiaries = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const end = start + pagination.value.rowsPerPage
  return diaries.value.slice(start, end)
})

const confirmDelete = (id) => {
  $q.dialog({
    title: '刪除日記',
    message: '確定要將這段回憶從樹洞中移除嗎？',
    cancel: { flat: true, color: 'grey-7', label: '取消' },
    ok: { flat: true, color: 'red-9', label: '確定刪除' },
    persistent: true,
  }).onOk(async () => {
    try {
      await serviceDiary.deleteById(id)
      $q.notify({ color: 'green', message: '已將紀錄移出樹洞' })
      fetchDiaries()
    } catch (error) {
      console.log(error)
      $q.notify({ color: 'red', message: '刪除失敗，請稍後再試' })
    }
  })
}

onMounted(fetchDiaries)
</script>

<style lang="scss" scoped>
.my-diary-card {
  border-radius: 15px;
  overflow: hidden;
}
.diary-content {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
  max-height: 185px;
  overflow-y: auto;
}
.mini-book-tab {
  border-radius: 4px;
  border: 1px solid #f5f5f5;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
}
</style>
