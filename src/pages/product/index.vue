<template>
  <q-page class="q-pa-xl bg-primary">
    <div class="mh-container">
      <div class="column items-center q-mb-lg">
        <div class="text-h4 text-brown-9 q-mb-sm">樹洞書屋</div>
        <div class="text-subtitle1 text-grey-6">找尋能與此刻心情共鳴的那本書</div>
      </div>

      <div class="row q-col-gutter-md justify-center q-mb-lg">
        <div class="col-12 col-md-4">
          <q-input
            v-model="search.text"
            dense
            outlined
            rounded
            placeholder="搜尋書名..."
            bg-color="grey-1"
          >
            <template v-slot:prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="search.sort"
            :options="sortOptions"
            option-label="text"
            dense
            outlined
            rounded
            bg-color="grey-1"
            color="grey-6"
            popup-content-class="text-grey-7"
            options-selected-class="text-brown-10 text-bold bg-brown-1"
            label-color="brown-6"
            input-style="text-brown-9 text-bold"
          />
        </div>
      </div>

      <q-scroll-area style="height: 120px; width: 100%" class="q-mb-xl">
        <div class="row justify-center q-gutter-sm q-mb-xl">
          <q-btn
            unelevated
            rounded
            label="全部"
            :color="!selectedMood ? 'brown-10' : 'grey-2'"
            :text-color="!selectedMood ? 'white' : 'grey-7'"
            @click="selectedMood = null"
          />
          <q-btn
            v-for="mood in moods"
            :key="mood._id"
            unelevated
            rounded
            :label="mood.name"
            :color="selectedMood === mood._id ? 'brown-10' : 'grey-2'"
            :text-color="selectedMood === mood._id ? 'white' : 'grey-7'"
            @click="selectedMood = mood._id"
          />
        </div>
      </q-scroll-area>
    </div>

    <div>
      <div v-if="filteredProducts.length > 0" class="row bg-primary">
        <div
          v-for="book in paginatedProducts"
          :key="book._id"
          class="col-12 col-sm-6 col-md-3 flex q-pa-md"
        >
          <ProductCard v-bind="book" />
        </div>
      </div>

      <div
        v-if="filteredProducts.length > 0"
        class="row justify-center items-center q-gutter-md q-mt-xl q-pb-lg"
      >
        <div class="row items-center">
          <span class="text-grey-7 q-mr-sm">每頁顯示：</span>
          <q-select
            v-model="pagination.rowsPerPage"
            :options="[4, 8, 12, 16, 20]"
            dense
            outlined
            rounded
            options-dense
            style="width: 85px"
            bg-color="white"
            color="brown-9"
            popup-content-class=" bg-primary text-brown-9"
            ptions-selected-class="bg-brown-9 text-white text-bold"
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

      <div v-else class="column items-center q-pt-xl text-grey-4">
        <q-icon name="o_auto_stories" size="80px" />
        <div class="text-h6 q-mt-md">書屋正在準備新的共鳴中...</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import serviceProduct from 'src/services/product'
import serviceMood from 'src/services/mood'
import ProductCard from 'src/components/productCard.vue'

const products = ref([])
const moods = ref([])
const selectedMood = ref(null)
const search = ref({
  text: '',
  sort: { text: '新到舊', key: 'createdAt', direction: -1 },
})

const sortOptions = [
  { text: '名稱', key: 'name', direction: 1 },
  { text: '價格: 低到高', key: 'price', direction: 1 },
  { text: '價格: 高到低', key: 'price', direction: -1 },
  { text: '新到舊', key: 'createdAt', direction: -1 },
  { text: '舊到新', key: 'createdAt', direction: 1 },
]

const pagination = ref({
  page: 1,
  rowsPerPage: 12,
})

const init = async () => {
  try {
    const [prodRes, moodRes] = await Promise.all([serviceProduct.get(), serviceMood.getAll()])
    products.value = prodRes.data.result || []
    moods.value = moodRes.data.result || []
  } catch (error) {
    console.error('資料載入失敗', error)
  }
}

const filteredProducts = computed(() => {
  return products.value
    .filter((p) => {
      const moodMatch =
        !selectedMood.value || p.moods.some((m) => (m._id || m) === selectedMood.value)
      const textMatch = p.name.toLowerCase().includes(search.value.text.toLowerCase())
      return moodMatch && textMatch
    })
    .slice()
    .sort((a, b) => {
      const { key, direction } = search.value.sort
      return a[key] > b[key] ? 1 * direction : -1 * direction
    })
})

const paginatedProducts = computed(() => {
  const { page, rowsPerPage } = pagination.value
  const start = (page - 1) * rowsPerPage
  const end = start + rowsPerPage
  return filteredProducts.value.slice(start, end)
})

const maxPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pagination.value.rowsPerPage) || 1
})

watch([() => search.value.text, selectedMood], () => {
  pagination.value.page = 1
})

onMounted(init)
</script>

<style lang="scss" scoped></style>

<route lang="yaml">
meta:
  title: '樹洞書屋'
</route>
