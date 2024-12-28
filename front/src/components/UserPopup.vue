<template>
  <q-dialog persistent ref="dialogRef" @hide="onDialogHide" :backdrop-filter="'blur(4px)'">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw;">
      <q-card-section class="row items-center mx-2 border-b-2">
        <div class="text-h6">User Info</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-form @submit.prevent="onSubmit(row)">
        <q-card-section class="row items-center">
          <q-input readonly label="Account" v-model="row.account"/>
        </q-card-section>
        <q-card-section class="row items-center">
          <q-input
            label="Password"
            v-model="row.password"
            :type="isPwd ? 'password' : 'text'"
            laze-rule
            :rules="[ val => val && val.length > 0 || 'Please input Password']"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
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
import { reactive, ref } from 'vue';
import { put } from '../utils/api';

export default {
  setup(props) {
    const $q = useQuasar();
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
    const row = reactive(props.data);
    const mode = props.mode;
    const isPwd = ref(true);

    async function onSubmit(data) {
      try {
        await put('/user', {
          password: data.password
        })
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
      isPwd,
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
    }
  },
  emits: [
    ...useDialogPluginComponent.emits
  ]
}
</script>