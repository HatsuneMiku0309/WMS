<template>
  <div class="q-pa-xs">    
    <q-table
      ref="qTable"
      class="my-sticky-column-table"
      title="Products"
      :rows="rows"
      :columns="columns"
      row-key="id"
      :filter="filter"
      no-data-label="I didn't find anything for you"
      :selected-rows-label="getSelectedString"
      selection="multiple"
      v-model:selected="selected"
      virtual-scroll
      :filter-method="filterData"
    >
    <template v-slot:top="props">
        <div class="col-2 q-table__title">Product Specs</div>

        <q-space />
        <q-input class="pr-2" borderless dense v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn class="mr-2" @click="createData()" label="Create" color="primary"/>
        <q-btn @click="removeRows()" label="Dels" color="red"/>
        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body-cell-image_meta="props">
        <q-td :props="props">
          <a v-if="props.row.image_blob" target="_blank" :href="props.row.image_blob"><img class="w-12 object-contain" :src="props.row.image_blob" /></a>
        </q-td>
      </template>
      <template v-slot:body-cell-product_id="props">
        <q-td :props="props">
          <div>{{ getProductData(props.row.product_id) }}</div>
        </q-td>
      </template>
      <template v-slot:body-cell-stock_id="props">
        <q-td :props="props">
          <div>{{ getStockData(props.row.stock_id) }}</div>
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
import ProductSpecPopup from '../components/ProductSpecPopup.vue';
import { useRouter } from 'vue-router';
import { b64toBlob } from '../utils/image';
import dayjs from 'dayjs';

const columns = [
  { name: 'id', label: 'ID', align: 'left', field: 'id', sortable: true },
  { name: 'image_meta', align: 'center', label: 'Image', field: 'image_meta' },
  { name: 'product_id', label: 'Product ID', field: 'product_id', sortable: true },
  { name: 'no', label: 'No', field: 'no', sortable: true },
  { name: 'name', label: 'Name', field: 'name', sortable: true },
  { name: 'count', label: 'Count', field: 'count' },
  { name: 'single_cost', label: 'Single Cost', field: 'single_cost' },
  { name: 'stock_id', label: 'Stock ID', field: 'stock_id', sortable: true },
  { name: 'create_time', label: 'Create Time', field: 'create_time', sortable: true },
  { name: 'func', align: 'center', label: '功能列', field: '' }
];

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const qTable = ref(null);
    const selected = ref([])
    const filter = ref('');
    const rows = reactive([]);
    const product_rows = [];
    const stock_rows = [];

    // get products data and vendors on mounted
    onMounted(async () => {
      try {
        $q.loading.show();
        const { data: { data } } = await get('/product_specs');
        const { data: { data: product_data } } = await get('/products');
        const { data: { data: stock_data } } = await get('/stocks');
        product_rows.push(...(product_data.map((d) => ({ id: d.id, no: d.no, name: d.name }))));
        stock_rows.push(...(stock_data.map((d) => ({ id: d.id, no: d.no, name: d.name }))));
        rows.push(...(data.map((d) => {
          if (d.image_meta) {
            const blob = b64toBlob(d.image_meta, d.mimetype)
            const blobUrl = URL.createObjectURL(blob);
            d.image_blob = blobUrl;
          }
          console.log(new Date(d.create_time));
          d.create_time = dayjs(new Date(d.create_time)).format('YYYY-MM-DD hh:mm:ss');
          const product_row = product_rows.find((product_row) => product_row.id === d.product_id) || { no: '', name: '' };
          d.product_no = product_row.no;
          d.product_name = product_row.name;
          const stock_row = stock_rows.find((stock_row) => stock_row.id === d.stock_id) || { no: '', name: '' };
          d.stock_no = stock_row.no;
          d.stock_name = stock_row.name;

          return d;
        })));
      } catch (err) {
        $q.notify({
          message: err.c_message,
          color: 'red'
        });
      } finally {
        $q.loading.hide();
      }
    });

    function getProductData(product_id) {
      let result = ''
      const product_row = product_rows.find((product_row) => {
        return product_row.id === product_id;
      });
      if (product_row) {
        result = `${product_row.no}-${product_row.name}`;
      }

      return result;
    };

    function getStockData(stock_id) {
      let result = ''
      const stock_row = stock_rows.find((stock_row) => {
        return stock_row.id === stock_id;
      });
      if (stock_row) {
        result = `${stock_row.no}-${stock_row.name}`;
      }

      return result;
    };

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
        component: ProductSpecPopup,
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
        component: ProductSpecPopup,
        componentProps: {
          data: tempRow,
          mode: 'Update'
        }
      }).onOk(() => {
        router.go();
      }).onCancel(() => {
        router.go();
      });
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
          await del(`/product_spec/${key}`);
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
            await del('/product_specs', {
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
    };

    function filterData (rows, term) {
      const filteredItems = rows.filter(row => `${row.id} || ${row.no} || ${row.name} || ${row.product_no} || ${row.product_name} || ${row.stock_no} || ${row.stock_name}`
        .toLowerCase().includes(term.toLowerCase()));

      return filteredItems;
    }

    return {
      filterData,
      filter,
      getProductData,
      getStockData,
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