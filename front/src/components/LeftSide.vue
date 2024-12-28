<template>
  <!-- <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered></q-drawer> -->
  <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
    <q-list>
      <q-item-label header>Essential Links</q-item-label>
      <router-link class="block"
      exactActiveClass="activeMenu" to="/">
        <q-item rel="noopener" v-ripple>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboar</q-item-label>
            <!-- <q-item-label caption>https://quasar.dev</q-item-label> -->
          </q-item-section>
        </q-item>
      </router-link>
      <router-link class="block"
      exactActiveClass="activeMenu" to="/products">
        <q-item rel="noopener" v-ripple>
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Products</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>
      <router-link class="block"
      exactActiveClass="activeMenu" to="/product_specs">
        <q-item rel="noopener" v-ripple>
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Product Specs</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>
      <router-link class="block"
      exactActiveClass="activeMenu" to="/vendors">
        <q-item rel="noopener" v-ripple>
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Vendors</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>
      <router-link class="block"
      exactActiveClass="activeMenu" to="/stocks">
        <q-item rel="noopener" v-ripple>
          <q-item-section avatar>
            <q-icon name="list" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Stocks</q-item-label>
          </q-item-section>
        </q-item>
      </router-link>
      

      <!-- <q-item clickable target="_blank" rel="noopener" href="https://quasar.dev">
        <q-item-section avatar>
          <q-icon name="school" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Docs</q-item-label>
          <q-item-label caption>https://quasar.dev</q-item-label>
        </q-item-section>
      </q-item> -->
    </q-list>
  </q-drawer>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const leftDrawerOpen = ref(false);
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    };
    return {
      leftDrawerOpen,
      toggleLeftDrawer
    }
  }
}
</script>

<style>
.activeMenu {
  background-color: #99c6cf;
}
</style>