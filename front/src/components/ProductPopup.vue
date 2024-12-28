<template>
  <q-dialog persistent ref="dialogRef" @hide="onDialogHide" :backdrop-filter="'blur(4px)'">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw;">
      <q-card-section class="row items-center mx-2 border-b-2">
        <div class="text-h6">{{ mode }} Product</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
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
            label="Vendor"
            class="w-full"
            clearable
            filled
            use-input
            input-debounce="0"
            emit-value
            map-options
            v-model="row.vendor_id"
            :options="filter_options"
            @filter="filterFn"
          />
        </q-card-section>
        <q-card-section class="row items-center">
          <label class="q-field__label">Dropshipping:</label>
          <q-radio v-model="row.dropshipping" val="Y" label="是" />
          <q-radio v-model="row.dropshipping" val="N" label="否" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input class="w-full" label="Dropshipping Url" v-model="row.dropshipping_url"/>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input label="Express Fee" v-model="row.express_fee"/>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input class="w-full" label="Image Path" v-model="row.image_path"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" type="submit" label="Submit" />
          <q-btn color="red" label="Cancel" @click="onDialogCancel" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { onMounted, reactive, ref } from 'vue';
import { get, put, post } from '../utils/api';
export default {
  setup(props) {
    const $q = useQuasar();
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
    const filter_options = ref([]);
    const vendor_options = [];
    const row = reactive(props.data);
    const mode = props.mode;

    // get vendors on mounted
    onMounted(async () => {
      const res = await get('/vendors');
      vendor_options.push(...(res.data.data).map((d) => {
        return {
          label: `${d.no}-${d.name}`,
          value: d.id
        }
      }));
      filter_options.value.push(...vendor_options);
    });

    async function onSubmit(data) {
      try {
        if (mode === 'Create') {
          await post(`/product`, {
            no: data.no,
            name: data.name,
            vendor_id: data.vendor_id,
            dropshipping: data.dropshipping,
            dropshipping_url: data.dropshipping_url,
            express_fee: data.express_fee,
            image_path: data.image_path
          });
        } else {
          await put(`/product/${data.id}`, {
            name: data.name,
            vendor_id: data.vendor_id,
            dropshipping: data.dropshipping,
            dropshipping_url: data.dropshipping_url,
            express_fee: data.express_fee,
            image_path: data.image_path
          });
        }
        $q.notify({
          message: `${mode} Success`,
          color: 'green',
          timeout: 700
        });
        let timer = setTimeout(() => {
          clearTimeout(timer);
          timer = null;
          onDialogOK(data);
        }, 700);
      } catch (err) {
        $q.notify({
          message: err.c_message,
          color: 'red'
        });
      }
    };

    // filter select_options when select input
    function filterFn(val, update) {
      update(() => {
        if (val === '') {
          filter_options.value = vendor_options;
        }
        else {
          const needle = val.toLowerCase()
          filter_options.value = vendor_options.filter(
            v => v.label.toLowerCase().indexOf(needle) !== -1 || v.id === needle
          );
        }
      });
    };

    return {
      filter_options,
      filterFn,
      row,
      onSubmit,
      dialogRef,
      onDialogHide,
      onDialogCancel
    }
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      validator(value) {
        return ['Create', 'Update'].includes(value)
      },
      default() {
        return 'Create'
      }
    },
  },
  emits: [
    ...useDialogPluginComponent.emits
  ]
}
</script>