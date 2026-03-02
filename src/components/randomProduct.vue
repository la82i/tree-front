<template>
  <div class="row justify-center bg-primary">
    <div v-for="book in randomProducts" :key="book._id" class="col-12 col-sm-6 col-md-3">
      <ProductCard v-bind="book" mode="standard" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import serviceProduct from 'src/services/product'
import ProductCard from 'src/components/productCard.vue'

const randomProducts = ref([])

const fetchRandom = async () => {
  try {
    const { data } = await serviceProduct.get()
    randomProducts.value = data.result.sort(() => Math.random() - 0.5).slice(0, 8)
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchRandom)
</script>
