<template>
  <div class="q-pa-xs">    
    <q-table
      ref="qTable"
      class="my-sticky-column-table"
      title="Products"
      :rows="rows"
      :columns="columns"
      row-key="id"
      no-data-label="I didn't find anything for you"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      v-model:selected="selected"
      virtual-scroll
    >
    <template v-slot:top="props">
        <div class="col-2 q-table__title">Products</div>

        <q-space />

        <q-btn class="mr-2" @click="createData()" label="Create" color="primary"/>
        <q-btn @click="removeRows()" label="Dels" color="red"/>
        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body-cell-vendor_id="props">
        <q-td :props="props">
          <div>{{ getVendorData(props.row.vendor_id) }}</div>
        </q-td>
      </template>
      <template v-slot:body-cell-func="props">
        <q-td :props="props">
          <div>
            <q-btn class="mr-2" @click="editRow(props.key)" label="Edit" color="primary"/>
            <q-btn @click="removeRow(props.key)" label="Del" color="red"/>
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
  <q-resize-observer @resize="onResize" />
</template>

<script>
import { get, del } from '../utils/api';
import { onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import ProductPopup from '../components/ProductPopup.vue';
import { useRouter } from 'vue-router';

const columns = [
  { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
  { name: 'no', label: 'No', field: 'no', sortable: true },
  { name: 'name', label: 'Name', field: 'name', sortable: true },
  { name: 'vendor_id', label: 'Vendor ID', field: 'vendor_id', sortable: true },
  { name: 'dropshipping', label: 'Dropshipping', field: 'dropshipping', format: val => val === 'Y' ? '是' : '否', sortable: true },
  { name: 'express_fee', label: 'Express Fee', field: 'express_fee' },
  { name: 'dropshipping_url', align: 'left', label: 'Dropshipping Url', field: 'dropshipping_url' },
  { name: 'create_time', label: 'Create Time', field: 'create_time', sortable: true },
  { name: 'image_path', align: 'left', label: 'Image Path', field: 'image_path' },
  { name: 'func', align: 'center', label: '功能列', field: '' }
];

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const qTable = ref(null);
    const selected = ref([])
    const rows = reactive([]);
    const vendor_rows = [];

    // get products data and vendors on mounted
    onMounted(async () => {
      try {
        $q.loading.show();
        const { data: { data } } = await get('/products');
        const { data: { data: vendor_datas } } = await get('/vendors');
        rows.push(...data);
        vendor_rows.push(...vendor_datas);
      } catch (err) {
        $q.notify({
          message: err.c_message,
          color: 'red'
        });
      } finally {
        $q.loading.hide();
      }
    });

    // table get vendor_data from table row vendor_id
    function getVendorData(vendor_id) {
      let result = ''
      const vendor_row = vendor_rows.find((vendor_option) => {
        return vendor_option.id === vendor_id;
      });
      if (vendor_row) {
        result = `${vendor_row.no}-${vendor_row.name}`;
      }

      return result;
    }

    // table multiple select total string at bottom
    function getSelectedString () {
      return selected.value.length === 0 ? '' : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rows.length}`
    };
    
    // window resize setting q-table max-height, because q-table use v-scroll
    // use q-resize-observer
    function onResize(size) {
      qTable.value.$el.style['max-height'] = `${size.height - 8}px`;
    };

    function createData() {
      const tempRow = { };
      $q.dialog({
        component: ProductPopup,
        componentProps: {
          data: tempRow,
          mode: 'Create'
        }
      }).onOk(() => {
        router.go();
      })
    }

    function editRow(key) {
      const tempRow = Object.assign({}, rows.find((row) => row.id === key));
      $q.dialog({
        component: ProductPopup,
        componentProps: {
          data: tempRow,
          mode: 'Update'
        }
      }).onOk(() => {
        router.go();
      })
    };

    function removeRow(key) {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure to delete id = ${key} ?`,
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
          await del(`/product/${key}`);
          $q.notify({
            message: `Delete Success`,
            color: 'green',
            timeout: 700
          });
          let timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            router.go();
          }, 700);
        } catch (err) {
          $q.notify({
            message: err.c_message,
            color: 'red'
          });
        }
      });
    };

    async function removeRows() {
      if (selected.value.length) {
        const ids = selected.value.map((s) => s.id);
        $q.dialog({
          title: 'Confirm Delete Batch',
          message: `Are you sure to delete id in (${ids}) ?`,
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
            await del('/products', {
              ids: ids
            });
            $q.notify({
              message: `Deletes Success`,
              color: 'green',
              timeout: 700
            });
            let timer = setTimeout(() => {
              clearTimeout(timer);
              timer = null;
              router.go();
            }, 700);
          } catch (err) {
            $q.notify({
              message: err.c_message,
              color: 'red'
            });
          }
        });
      }
    }

    return {
      getVendorData,
      removeRows,
      removeRow,
      createData,
      editRow,
      qTable,
      selected,
      getSelectedString,
      columns,
      rows,
      onResize
    }
  }
}
</script>

<style lang="scss">
.my-sticky-column-table {
  thead tr:first-child th:first-child, th:nth-child(2), th:last-child  {
    background-color: #c1c1c1;
  };

  td:first-child, td:nth-child(2), td:last-child {
    background-color: #c1c1c1;
  }

  tr th {
    top: 0;
    position: sticky;
    /* higher than z-index for td below */
    z-index: 2;
    /* bg color is important; just specify one */
    background: #c1c1c1;
  }

  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    z-index: 3;
  }

  th:last-child,
  td:last-child {
    position: sticky;
    right: 0;
    z-index: 3;
  }

  th:nth-child(2), td:nth-child(2) {
    position: sticky;
    left: 72px;
    z-index: 3;
  }
}
</style>