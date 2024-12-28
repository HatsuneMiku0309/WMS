<template>
  <q-layout view="lHh lpR lFr">
    <c-header @toggle-left-drawer="toggleLeftDrawer"></c-header>
    <left-side ref="leftSide" @update:x="toggleLeftDrawer"></left-side>
    <right-side ref="rightSide" @update:x="toggleRightDrawer"></right-side>

    <q-page-container>
      <q-page class="overflow-y-auto h-0">
        <router-view />
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref } from 'vue'
import LeftSide from '../components/LeftSide.vue';
import RightSide from '../components/RightSide.vue';
import CHeader from '../components/CHeader.vue';

export default {
  setup () {
    const leftSide = ref(null);
    const rightSide = ref(null);


    return {
      leftSide,
      toggleLeftDrawer () {
        leftSide.value.toggleLeftDrawer();
      },
      rightSide,
      toggleRightDrawer () {
        rightSide.value.toggleRightDrawer();
      }
    }
  },
  components: {
    RightSide,
    LeftSide,
    CHeader
  }
}
</script>