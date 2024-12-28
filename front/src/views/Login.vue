<template>
  <q-layout view="hHh lpR fFf" class="w-screen">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          Title
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex justify-center items-center">
        <q-form autofocus greedy @submit.prevent="onSubmit" class="q-pa-md">
          <q-input
            filled
            label="Account"
            v-model="account"
            hint="Username or Email"
            laze-rule
            :rules="[ val => val && val.length > 0 || 'Please input Account']"
            inputmode="email"
          />
          <q-input
            label="Password"
            v-model="password"
            filled
            :type="isPwd ? 'password' : 'text'"
            laze-rule
            :rules="[ val => val && val.length > 0 || 'Please input Password']"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-card-actions align="center">
            <q-btn label="Singin" type="submit" color="primary"/>
            <!-- <q-btn label="Singup" color="secondary" /> -->
          </q-card-actions>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useRouter } from 'vue-router';
import { reactive, toRefs, ref, onBeforeMount } from 'vue';
import { post } from '../utils/api';
import { useQuasar } from 'quasar'

export default {
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const isPwd = ref(true);
    const formData = reactive({
      account: '',
      password: ''
    });

    const onSubmit = async () => {
      try {
        $q.loading.show();
        const res = await post('login', {
          account: formData.account,
          password: formData.password
        });
        $q.cookies.set('account_id', res.data.data.id);
        $q.cookies.set('account', res.data.data.account);
        $q.notify({
          message: 'Login Success',
          color: 'green',
          timeout: 700
        });
        let timer = setTimeout(() => {
          $q.loading.hide();
          clearTimeout(timer);
          timer = null;
          router.replace('/');
        }, 700);
      } catch (err) {
        $q.loading.hide();
        $q.notify({
          message: err.c_message,
          color: 'red'
        });
      }
    };

    return {
      onSubmit,
      isPwd,
      ...toRefs(formData)
    }
  }
}
</script>