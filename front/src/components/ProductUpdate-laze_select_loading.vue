<template>
  <q-dialog persistent ref="dialogRef" @hide="onDialogHide" :backdrop-filter="'blur(4px)'">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6 pb-2 border-b-2">{{ mode }} Product</div>
      </q-card-section>
      <q-form @submit.prevent="onSubmit(row)">
        <q-card-section v-if="mode === 'Update'" class="row items-center">
          <q-input  required disable label="ID" v-model="row.id"/>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input required v-if="mode === 'Create'" label="No" v-model="row.no"/>
          <q-input required disable v-else label="No" v-model="row.no"/>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input class="w-full" label="Name" v-model="row.name"/>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-select
            class="w-full"
            clearable
            filled
            color="purple-12"
            option-value="value"
            option-label="label"
            option-disable="inactive"
            emit-value
            map-options
            v-model="row.vendor_id"
            :options="options"
            :loading="loading"
            @virtual-scroll="onScroll"
          />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-radio v-model="row.dropshipping" val="Y" label="是" />
          <q-radio v-model="row.dropshipping" val="N" label="否" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input label="Dropshipping Url" v-model="row.dropshipping_url"/>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input label="Express Fee" v-model="row.express_fee"/>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input label="Image Path" v-model="row.image_path"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" type="submit" label="Submit" />
          <q-btn color="primary" label="Cancel" @click="onDialogCancel" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDialogPluginComponent } from 'quasar'
import { nextTick, computed, onMounted, reactive, ref } from 'vue';
import { get } from '../utils/api';
const pageSize = 10;
let lastPage = 0;

export default {
  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
    const vendor_datas = ref([]);
    const loading = ref(false);
    const row = reactive(props.data);
    const nextPage = ref(2);
    const options = computed(() => {
      return vendor_datas.value.slice(0, pageSize * (nextPage.value - 1))
    });
    onMounted(async () => {
      const res = await get('/vendors');
      vendor_datas.value.push(...(res.data.data).map((d) => {
        return {
          label: `${d.no}-${d.name}`,
          value: d.id
        }
      }));
      lastPage = Math.ceil(vendor_datas.value.length / pageSize)
    });

    function onSubmit(row) {
      console.log(row);
      // onDialogOK(row);
    };

    function onScroll ({ to, ref }) {
      const lastIndex = options.value.length - 1

      console.log(loading.value !== true);
      console.log(nextPage.value);
      console.log(lastPage);
      console.log(to === lastIndex)
      if (loading.value !== true && nextPage.value <= lastPage && to === lastIndex) {
        loading.value = true

        setTimeout(() => {
          nextPage.value++
          nextTick(() => {
            ref.refresh()
            loading.value = false
          })
        }, 500)
      }
    }

    return {
      vendor_datas,
      loading,
      nextPage,
      options,
      row,
      onSubmit,
      dialogRef,
      onDialogHide,
      onDialogCancel,
      onScroll
    }
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      validator(value, props) {
        return ['Create', 'Update'].includes(value)
      },
      default() {
        return 'Create'
      }
    },
  },
  emits: [
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits
  ]
}
</script>