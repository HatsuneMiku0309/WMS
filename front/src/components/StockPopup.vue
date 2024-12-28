<template>
  <q-dialog persistent ref="dialogRef" @hide="onDialogHide" :backdrop-filter="'blur(4px)'">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw;">
      <q-card-section class="row items-center mx-2 border-b-2">
        <div class="text-h6">{{ mode }} Stock</div>
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
import { reactive } from 'vue';
import { put, post } from '../utils/api';
export default {
  setup(props) {
    const $q = useQuasar();
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
    const row = reactive(props.data);
    const mode = props.mode;

    async function onSubmit(data) {
      try {
        if (mode === 'Create') {
          await post(`/stock`, {
            no: data.no,
            name: data.name
          });
        } else {
          await put(`/stock/${data.id}`, {
            name: data.name
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

    return {
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