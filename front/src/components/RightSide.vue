<template>
  <q-drawer v-model="rightDrawerOpen" side="right" bordered>
    drawer content
  </q-drawer>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const rightDrawerOpen = ref(false);
    const toggleRightDrawer = () => {
      rightDrawerOpen.value = !rightDrawerOpen.value;
    };
    return {
      rightDrawerOpen,
      toggleRightDrawer
    }
  }
}
</script>