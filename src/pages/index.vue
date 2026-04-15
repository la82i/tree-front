<template>
  <q-page class="bg-primary shadow-inner">
    <div class="row">
      <div class="col-12">
        <q-carousel
          v-model="slide"
          ref="carousel"
          animated
          infinite
          swipeable
          height="86vh"
          class="bg-primary shadow-2"
        >
          <q-carousel-slide
            v-for="video in currentVideos"
            :key="video.name"
            :name="video.name"
            class="column no-wrap flex-center q-pa-none"
          >
            <video
              class="absolute-full"
              autoplay
              loop
              muted
              playsinline
              style="width: 100%; height: 100%; object-fit: cover"
            >
              <source :src="video.video" type="video/mp4" />
            </video>
            <div
              class="absolute-full column justify-end items-center text-white"
              style="background: rgba(0, 0, 0, 0.3); padding-bottom: 100px"
            >
              <div class="text-h5 text-center" style="letter-spacing: 3px; opacity: 0.9">
                深呼吸，開啟聲音，將繁雜的思緒暫時放下
              </div>
              <q-btn
                class="q-mt-md"
                round
                flat
                dense
                color="white"
                size="md"
                :icon="isMuted ? 'volume_off' : 'volume_up'"
                v-if="$q.screen.lt.sm"
                @click.stop="toggleSound"
              />
            </div>
          </q-carousel-slide>

          <template v-slot:control>
            <q-carousel-control
              position="bottom"
              :offset="[0, 30]"
              class="full-width row items-center q-px-xl"
            >
              <div class="col row justify-start">
                <q-btn
                  round
                  flat
                  dense
                  color="white"
                  size="md"
                  :icon="isMuted ? 'volume_off' : 'volume_up'"
                  v-if="$q.screen.gt.xs"
                  @click="toggleSound"
                />
              </div>

              <div class="row items-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  color="white"
                  icon="chevron_left"
                  @click="$refs.carousel.previous()"
                />
                <q-btn
                  outline
                  rounded
                  color="white"
                  label="開始探索"
                  size="md"
                  class="q-px-md q-px-sm-xl"
                  style="letter-spacing: 4px; backdrop-filter: blur(5px)"
                  @click="scrollToDraw"
                />
                <q-btn
                  flat
                  round
                  dense
                  color="white"
                  icon="chevron_right"
                  @click="$refs.carousel.next()"
                />
              </div>
              <div class="col"></div>
            </q-carousel-control>
          </template>
        </q-carousel>
      </div>
    </div>

    <audio ref="bgMusic" :src="currentMusic" loop></audio>

    <div
      ref="drawSectionRef"
      class="flex flex-center q-py-xl"
      style="min-height: 100vh; scroll-margin-top: 70px"
    >
      <div class="column items-center">
        <div
          class="text-h5 text-weight-light text-brown-9 text-center q-mb-xl"
          style="letter-spacing: 3px"
        >
          挑選一張吸引你的卡片，覺察自己的情緒
        </div>

        <div class="row justify-center q-gutter-md">
          <div
            v-for="n in 4"
            :key="n"
            class="card-container"
            :style="{ pointerEvents: hasPickedCard || cards.length === 0 ? 'none' : 'auto' }"
          >
            <div
              class="card-inner"
              :ref="(el) => (cardRefs[n - 1] = el)"
              @click="handleFlipAndPick(cards[n - 1], n - 1)"
            >
              <div class="card-side side-back">
                <q-card class="card-origin-style cursor-pointer full-height" flat v-ripple>
                  <q-img :src="cardImg" fit="cover" class="full-height" />
                </q-card>
              </div>

              <div class="card-side side-front">
                <q-card class="card-origin-style cursor-pointer full-height" flat>
                  <q-img
                    v-if="cards[n - 1]"
                    :src="cards[n - 1].imageUrl"
                    fit="cover"
                    class="full-height"
                  >
                    <template v-slot:placeholder>
                      <q-inner-loading showing
                        ><q-spinner-hearts color="brown-3" size="3em"
                      /></q-inner-loading>
                    </template>
                  </q-img>
                </q-card>
              </div>
            </div>
          </div>
        </div>

        <q-btn
          flat
          label="重新換一批卡片"
          icon="refresh"
          color="brown-5"
          class="q-mt-md"
          @click="init"
        />
      </div>
    </div>

    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card
        v-if="selectedCard"
        class="mh-hide-scrollbar shadow-24"
        style="width: 1000px; max-width: 95vw"
      >
        <q-btn
          icon="close"
          flat
          round
          dense
          color="brown-5"
          v-close-popup
          class="absolute-top-right q-ma-md z-max"
        />

        <div class="q-pa-xl">
          <div class="row q-col-gutter-xl items-start">
            <div class="col-12 col-md-4 flex justify-center">
              <q-img
                :src="selectedCard.imageUrl"
                fit="contain"
                style="width: 100%"
                class="rounded-borders"
              />
            </div>

            <div class="col-12 col-md-8 column">
              <div class="text-h4 text-bold text-brown-9 q-mb-sm text-center text-md-left">
                {{ selectedCard.name }}
              </div>
              <div class="row q-gutter-xs q-mb-md justify-center justify-md-start">
                <q-chip
                  v-for="m in selectedCard.moods"
                  :key="m._id"
                  size="sm"
                  color="brown-2"
                  text-color="brown-9"
                >
                  # {{ m.name }}
                </q-chip>
              </div>
              <p class="text-body1 text-brown-9 card-text text-md-left">
                {{ selectedCard.description }}
              </p>

              <div class="recommended-books q-mt-lg">
                <div class="text-subtitle1 text-bold text-brown-9 q-mb-sm">
                  樹洞回響：為你推薦的書籍
                </div>
                <div v-if="loadingBooks"><q-spinner-dots color="brown" size="20px" /></div>
                <div v-else-if="recommendedBooks.length > 0">
                  <div v-for="book in recommendedBooks" :key="book._id">
                    <ProductCard v-bind="book" mode="mini" />
                  </div>
                </div>
                <div v-else class="text-grey-6 text-caption">目前樹洞裡暫時沒有適合的推薦。</div>
              </div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="full-width">
            <div class="text-subtitle1 text-bold q-mb-sm text-brown-9">
              今日心情：寫一段話留給樹洞
            </div>
            <q-input
              v-model="diaryContent"
              type="textarea"
              filled
              bg-color="grey-1"
              rows="4"
              placeholder="在此處傾訴你的心情..."
              maxlength="1000"
            />
            <div class="row justify-end q-mt-md q-gutter-x-md">
              <q-btn flat label="重新抽一張" color="grey-7" @click="resetSelection" v-close-popup />
              <q-btn
                unelevated
                label="保存日記"
                class="mh-btn-action"
                color="brown-10"
                :loading="isSaving"
                @click="saveDiary"
              />
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

    <q-separator inset class="q-mb-xl" />
    <div class="q-pa-md text-center">
      <div class="text-h4 q-mb-xl text-brown-9">樹洞隨機推薦</div>
      <randomProduct />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { gsap } from 'gsap'
import serviceCard from 'src/services/card'
import serviceProduct from 'src/services/product'
import serviceDiary from 'src/services/diary'
import { useUserStore } from 'src/stores/user'
import ProductCard from 'src/components/productCard.vue'
import randomProduct from 'src/components/randomProduct.vue'

const $q = useQuasar()
const router = useRouter()
const user = useUserStore()
const slide = ref('video1')
const bgMusic = ref(null)
const isMuted = ref(true)
const showDialog = ref(false)
const hasPickedCard = ref(false)
const cards = ref([])
const cardRefs = ref([])
const selectedCard = ref(null)
const drawSectionRef = ref(null)
const recommendedBooks = ref([])
const diaryContent = ref('')
const isSaving = ref(false)
const loadingBooks = ref(false)
const isAnimating = ref(false)
const baseUrl = import.meta.env.BASE_URL

const cardImg = `${baseUrl}images/card.png`
const currentVideos = [
  { name: 'video1', video: `${baseUrl}video/rainy.mp4` },
  { name: 'video2', video: `${baseUrl}video/fire.mp4` },
]
const musicMap = { video1: `${baseUrl}audio/rainy.mp3`, video2: `${baseUrl}audio/fire.mp3` }
const currentMusic = computed(() => musicMap[slide.value] || '')

onMounted(() => {
  init()
})

const init = async () => {
  if (isAnimating.value) return
  isAnimating.value = true
  hasPickedCard.value = false

  cardRefs.value.forEach((el) => {
    if (el) gsap.set(el, { rotationY: 0 })
  })

  try {
    const { data } = await serviceCard.getRandom()
    cards.value = data.result
    await nextTick()

    gsap.fromTo(
      '.card-container',
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        onComplete: () => (isAnimating.value = false),
      },
    )
  } catch (error) {
    console.log(error)
    isAnimating.value = false
    $q.notify({ color: 'red', message: '無法聯繫樹洞' })
  }
}

const handleFlipAndPick = (card, index) => {
  if (!card || hasPickedCard.value) return
  hasPickedCard.value = true

  gsap.to(cardRefs.value[index], {
    rotationY: 180,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: async () => {
      selectedCard.value = card
      if (card.moods?.length > 0) {
        loadingBooks.value = true
        try {
          const { data } = await serviceProduct.getRecommend(card.moods[0]._id)
          recommendedBooks.value = data.result.slice(0, 1)
        } catch (err) {
          console.error('獲取推薦書籍失敗:', err)
          recommendedBooks.value = []
          $q.notify({ color: 'negative', message: '獲取推薦書籍失敗' })
        } finally {
          loadingBooks.value = false
        }
      }
      setTimeout(() => {
        showDialog.value = true
      }, 200)
    },
  })
}

const scrollToDraw = () => {
  drawSectionRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const toggleSound = () => {
  isMuted.value = !isMuted.value
  if (bgMusic.value) {
    if (!isMuted.value) {
      bgMusic.value.volume = 0.4
      bgMusic.value.play().catch(() => {})
    } else {
      bgMusic.value.pause()
    }
  }
}

const saveDiary = async () => {
  if (!diaryContent.value.trim()) return $q.notify({ color: 'orange', message: '請寫下一些話' })
  if (!user.isLoggedIn) {
    $q.notify({ color: 'red', message: '請先登入會員才能保存日記' })
    return router.push('/login')
  }
  isSaving.value = true
  try {
    await serviceDiary.create({ cardId: selectedCard.value._id, content: diaryContent.value })
    $q.notify({ color: 'green', message: '日記已收進樹洞' })
    router.push('/diary')
  } catch (error) {
    console.log(error)
    $q.notify({ color: 'red', message: '儲存失敗' })
  } finally {
    isSaving.value = false
  }
}

const resetSelection = () => {
  showDialog.value = false
  selectedCard.value = null
  diaryContent.value = ''
  recommendedBooks.value = []
  init()
}

watch(slide, async () => {
  if (!isMuted.value && bgMusic.value) {
    await nextTick()
    bgMusic.value.play().catch(() => {})
  }
})
</script>

<style lang="scss" scoped>
.card-container {
  width: 350px;
  height: 580px;
  border-radius: 12px;
  perspective: 2000px;
}
.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  cursor: pointer;
}
.card-side {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}
.side-back {
  z-index: 2;
  transform: rotateY(0deg);
}
.side-front {
  transform: rotateY(180deg);
  z-index: 1;
}
.card-origin-style {
  background: transparent;
  border: none;
  overflow: hidden;
  &:hover {
    box-shadow: 0 10px 10px rgba(0, 0, 0, 0.05);
  }
}
.card-text {
  white-space: pre-wrap;
}
</style>
