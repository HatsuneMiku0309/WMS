<template>
  <q-dialog persistent ref="dialogRef" @hide="onDialogHide" :backdrop-filter="'blur(4px)'">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw;">
      <q-card-section class="row items-center mx-2 border-b-2">
        <div class="text-h6">{{ mode }} Product Spec</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-form @submit.prevent="onSubmit(row)">
        <q-card-section v-if="mode === 'Update'" class="row items-center">
          <q-input  required disable label="ID" v-model="row.id"/>
        </q-card-section>
        <q-card-section class="items-center">
          <a class="relative w-32 block" v-if="row.image_blob && !temp_update_file" target="_blank" :href="row.image_blob">
            <img class="w-32" :src="row.image_blob"/>
            <q-icon class="cursor-pointer absolute top-0 right-0" name="close" @click.stop.prevent="removeImage(row)" />
          </a>
          <a v-else target="_blank" :href="upload_meta"><img class="w-32" :src="upload_meta"/></a>
          <q-file 
            class="pt-2" filled bottom-slots v-model="temp_update_file" label="Label" counter
            max-file-size="20480000"
            accept=".jpg, image/*, .png, .jpeg"
            @rejected="onRejected"
            @update:model-value="uploadFile"
          >
            <template v-slot:prepend>
              <q-icon name="cloud_upload" @click.stop.prevent />
            </template>
            <template v-slot:append>
              <q-icon name="close" @click.stop.prevent="temp_update_file = null; upload_meta = null;" class="cursor-pointer" />
            </template>

            <template v-slot:hint>
              Field hint
            </template>
          </q-file>
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
            label="Product"
            class="w-full"
            clearable
            filled
            use-input
            input-debounce="0"
            emit-value
            map-options
            v-model="row.product_id"
            :options="product_filter_options"
            @filter="productFilterFn"
          />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input class="w-full" label="Count" v-model="row.count"/>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-select
            label="Stock"
            class="w-full"
            clearable
            filled
            use-input
            input-debounce="0"
            emit-value
            map-options
            v-model="row.stock_id"
            :options="stock_filter_options"
            @filter="stockFilterFn"
          />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input label="Single cost" v-model="row.single_cost"/>
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
import { get, put, post, del } from '../utils/api';
export default {
  setup(props) {
    const $q = useQuasar();
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
    const product_filter_options = ref([]);
    const product_options = [];
    const stock_filter_options = ref([]);
    const stock_options = [];
    const row = reactive(props.data);
    const mode = props.mode;
    const temp_update_file = ref(null);
    const upload_meta = ref('');

    // get products and stocks on mounted
    onMounted(async () => {
      const product_res = await get('/products');
      const stock_res = await get('/stocks');
      product_options.push(...(product_res.data.data).map((d) => {
        return {
          label: `${d.no}-${d.name}`,
          value: d.id
        }
      }));
      stock_options.push(...(stock_res.data.data).map((d) => {
        return {
          label: `${d.no}-${d.name}`,
          value: d.id
        }
      }));
      product_filter_options.value.push(...product_options);
      stock_filter_options.value.push(...stock_options);
    });

    async function onSubmit(data) {
      const formData = new FormData();
      formData.append('upload_image', temp_update_file.value);
      formData.append('dir', 'product_specs');
      const d = await post('/media/upload', formData);
      const media_id = d.data.data.length === 1 ? d.data.data[0].id : null;
      try {
        if (mode === 'Create') {
          await post(`/product_spec`, {
            no: data.no,
            name: data.name,
            product_id: data.product_id,
            count: data.count,
            stock_id: data.stock_id,
            single_cost: data.single_cost,
            media_id: media_id
          });
        } else {
          await put(`/product_spec/${data.id}`, {
            name: data.name,
            product_id: data.product_id,
            count: data.count,
            stock_id: data.stock_id,
            single_cost: data.single_cost,
            media_id: media_id
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
        del(`/media/${media_id}`);
        $q.notify({
          message: err.c_message,
          color: 'red'
        });
      }
    };

    // filter select_options when select input
    function productFilterFn(val, update) {
      update(() => {
        if (val === '') {
          product_filter_options.value = product_options;
        }
        else {
          const needle = val.toLowerCase()
          product_filter_options.value = product_options.filter(
            v => v.label.toLowerCase().indexOf(needle) !== -1 || v.id === needle
          );
        }
      });
    };

    // filter select_options when select input
    function stockFilterFn(val, update) {
      update(() => {
        if (val === '') {
          stock_filter_options.value = stock_options;
        }
        else {
          const needle = val.toLowerCase()
          stock_filter_options.value = stock_options.filter(
            v => v.label.toLowerCase().indexOf(needle) !== -1 || v.id === needle
          );
        }
      });
    };

    // when file input select file, but reject
    function onRejected (rejectedEntries) {
      $q.notify({
        type: 'negative',
        message: `${rejectedEntries.length} file(s) did not pass validation constraints`
      })
    };

    // upload and show to img preview
    function uploadFile(e) {
      if (upload_meta.value) {
        URL.revokeObjectURL(upload_meta.value)
      }
      upload_meta.value = URL.createObjectURL(e);
    };

    async function removeImage(data) {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure to delete image ?`,
        cancel: {
          push: true
        },
        ok: {
          push: true,
          color: 'red'
        },
        persistent: true
      }).onOk(async () => {
        try {
          await del(`/media/${data.media_id}`);
          await put(`/product_spec/${data.id}`, {
            name: data.name,
            product_id: data.product_id,
            count: data.count,
            stock_id: data.stock_id,
            single_cost: data.single_cost,
            media_id: null
          });
          delete row.media_id;
          delete row.image_meta;
          delete row.mimetype;
          delete row.new_filename;
          delete row.image_blob;
        } catch (err) {
          $q.notify({
            message: err.c_message,
            color: 'red'
          });
        }
      });
    }

    return {
      removeImage,
      upload_meta,
      uploadFile,
      temp_update_file,
      onRejected,
      product_filter_options,
      stock_filter_options,
      productFilterFn,
      stockFilterFn,
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