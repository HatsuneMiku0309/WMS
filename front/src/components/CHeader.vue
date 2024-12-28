<template>
  <q-header bordered class="bg-primary text-white">
    <q-toolbar>
      <q-btn dense flat round icon="menu" @click="$emit('toggleLeftDrawer')" />

      <q-toolbar-title>
        <q-avatar>
          <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
        </q-avatar>
        WMS
      </q-toolbar-title>
      <div class="q-gutter-sm row items-center no-wrap">
          <q-btn round dense flat color="white" :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
                 @click="$q.fullscreen.toggle()"
                 v-if="$q.screen.gt.sm">
          </q-btn>
          <!-- <q-btn round dense flat color="white" icon="fab fa-github" type="a" href="https://github.com/pratik227/quasar-admin" target="_blank">
          </q-btn>
          <q-btn round dense flat icon="fas fa-heart" style="color:#9d4182 !important;" type="a" href="https://github.com/sponsors/pratik227" target="_blank">
          </q-btn> -->
          <q-btn round flat>
            <q-avatar size="26px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup>
                  <q-item-section @click="repass">repass</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section @click="logout">Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      <!-- <q-btn dense flat round icon="menu" @click="toggleRightDrawer" /> -->
    </q-toolbar>
  </q-header>
</template>

<script>
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { put } from '../utils/api';
import UserPopup from './UserPopup.vue';

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();

    function logout() {
      $q.cookies.remove('account');
      $q.cookies.remove('account_id');
      $q.notify({
        message: 'Logout Success',
        color: 'green',
        timeout: 700
      });

      setTimeout(() => {
        router.replace('/login');
      }, 1000);
    };

    function repass() {
      const account = $q.cookies.get('account');
      const account_id = $q.cookies.get('account_id');
      $q.dialog({
        component: UserPopup,
        componentProps: {
          data: {
            account,
            account_id,
            password: ''
          }
        }
      }).onOk(() => {
        try {
          $q.loading.show();
          let timer = setTimeout(() => {
            $q.loading.hide();
            clearTimeout(timer);
            timer = null;
            router.replace('/login');
          }, 700);
        } catch (err) {
          $q.loading.hide();
          $q.notify({
            message: err.c_message,
            color: 'red'
          });
        }
      });
    }

    return {
      repass,
      logout
    }
  }
}
</script>