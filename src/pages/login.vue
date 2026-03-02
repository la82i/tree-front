<template>
  <q-page class="q-pa-xl bg-primary">
    <div class="mh-container">
      <div class="row justify-center">
        <div class="col-12">
          <h1 class="text-h4 text-brown-9 q-mb-sm text-center">登入</h1>
        </div>
        <div class="col-md-4">
          <q-form :disable="form.isSubmitting.value" @submit="submit">
            <q-input
              v-model="account.value.value"
              :error="!!account.errorMessage.value"
              :error-message="account.errorMessage.value"
              label="帳號"
              hint="長度 4 ~ 20 的英數字"
              counter
            />
            <q-input
              v-model="password.value.value"
              :error="!!password.errorMessage.value"
              :error-message="password.errorMessage.value"
              label="密碼"
              hint="長度 4 ~ 20 的英數字"
              type="password"
              counter
            />
            <div class="row justify-center q-mt-xl">
              <q-btn :loading="form.isSubmitting.value" type="submit" class="q-mt-md">登入</q-btn>
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import validator from 'validator'
import { useField, useForm } from 'vee-validate'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import serviceUser from 'src/services/user'
import { useUserStore } from 'src/stores/user'

const router = useRouter()
const $q = useQuasar()
const user = useUserStore()

const schema = yup.object({
  account: yup
    .string()
    .required('帳號必填')
    .min(4, '帳號最少4個字')
    .max(20, '帳號最多20個字')
    .test('isAlphanumeric', '帳號只能是英數字', (value) => validator.isAlphanumeric(value)),
  password: yup
    .string()
    .required('密碼必填')
    .min(4, '密碼最少 4 個字')
    .max(20, '密碼最多 20 個字')
    .test('isAscii', '密碼只能是英數字', (value) => validator.isAscii(value)),
})

const form = useForm({
  validationSchema: schema,
  initialValues: {
    account: '',
    password: '',
  },
})

const account = useField('account')
const password = useField('password')

const submit = form.handleSubmit(async (values) => {
  try {
    const { data } = await serviceUser.login(values)
    user.login(data.result)

    $q.notify({ color: 'green', message: '登入成功' })
    router.push('/')
  } catch (error) {
    console.log(error)
    const text = error?.response?.data?.message || '發生錯誤'
    $q.notify({ color: 'red', message: text })
  }
})
</script>

<route lang="yaml">
meta:
  title: '登入'
  login: no-login-only
</route>
